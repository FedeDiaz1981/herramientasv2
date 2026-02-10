(() => {
	window.addEventListener('load', () => {
		if (window.lucide?.createIcons) {
			window.lucide.createIcons();
		}
		if (!window.XLSX) {
			return;
		}

		/* MOTOR DE PROCESAMIENTO ORIGINAL RECUPERADO */
		const $ = (id) => document.getElementById(id);
		const ui = {
			file: $('file'),
			run: $('run'),
			reset: $('reset'),
			log: $('log'),
			k_in: $('k_in'),
			k_emp: $('k_emp'),
			k_merged: $('k_merged'),
			k_out: $('k_out'),
			k_ok: $('k_ok'),
			k_errRows: $('k_errRows'),
			time: $('time'),
			dot: $('dot'),
			pillText: $('pillText'),
			barFill: $('barFill'),
		};
		const state = { file: null };
		const FIXED_DATE_COL = 9;
		const FIXED_TIME_COL = 10;

		function pad(n) {
			return String(n).padStart(2, '0');
		}
		function ts() {
			const d = new Date();
			return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
		}
		function nowStamp() {
			const d = new Date();
			return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}_${pad(
				d.getHours(),
			)}-${pad(d.getMinutes())}`;
		}
		function setPill(kind, text) {
			ui.pillText.textContent = text;
			ui.dot.className = `dot${kind === 'ok' ? ' ok' : kind === 'bad' ? ' bad' : ''}`;
		}
		function setStage(pct) {
			ui.barFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
		}
		function log(line) {
			ui.log.textContent += `[${ts()}] ${line}\n`;
			ui.log.scrollTop = ui.log.scrollHeight;
		}
		function updateTime() {
			if (ui.time) ui.time.textContent = ts();
		}

		function superClean(v) {
			return v == null ? '' : String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
		}
		function normalizeText(v) {
			return v == null
				? ''
				: String(v)
						.replace(/^\uFEFF/, '')
						.replace(/[\u00A0\u202F\u2009]/g, ' ')
						.replace(/\s+/g, ' ')
						.trim();
		}
		function normalizeId(v) {
			if (v == null || v === '') return '';
			if (typeof v === 'number' && isFinite(v)) return String(Math.trunc(v));
			const m = normalizeText(v).match(/^(\d+)/);
			return m ? m[1] : normalizeText(v);
		}
		function parseDateString(v) {
			if (!v) return null;
			if (typeof v === 'number') {
				const o = XLSX.SSF.parse_date_code(v);
				return { y: o.y, m: o.m, d: o.d };
			}
			const s = normalizeText(v);
			const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
			if (m) return { y: +m[3], m: +m[2], d: +m[1] };
			return null;
		}
		function parseTimeSeconds(v) {
			if (v == null || v === '') return null;
			if (typeof v === 'number') {
				const frac = v % 1;
				return Math.round(frac * 86400);
			}
			const s = normalizeText(v).toLowerCase();
			const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
			if (!m) return null;
			let hh = +m[1],
				mm = +m[2],
				ss = m[3] ? +m[3] : 0;
			if (s.includes('pm') && hh < 12) hh += 12;
			return hh * 3600 + mm * 60 + ss;
		}
		function dateKey(p) {
			return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
		}
		function dateScore(p) {
			return p.y * 10000 + p.m * 100 + p.d;
		}
		function isNextDay(p1, p2) {
			const t1 = Date.UTC(p1.y, p1.m - 1, p1.d);
			const t2 = Date.UTC(p2.y, p2.m - 1, p2.d);
			return Math.abs(t2 - t1 - 86400000) < 1000;
		}
		function classifyEvent(raw) {
			const k = superClean(raw);
			if (!k) return null;
			if (k.includes('inicio') || k.includes('entrada') || k.includes('llegada')) return 'IN';
			if (k.includes('fin') || k.includes('salida') || k.includes('partida')) return 'OUT';
			return null;
		}

		updateTime();
		setInterval(updateTime, 1000);

		async function process() {
			ui.run.disabled = true;
			ui.log.textContent = '';
			setPill('neutral', 'Procesando');
			setStage(10);
			log('Iniciando lectura del archivo...');
			const aoa = await (async () => {
				const buf = await state.file.arrayBuffer();
				const wb = XLSX.read(buf, { type: 'array', cellDates: false });
				return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
					header: 1,
					defval: '',
				});
			})();
			log('Lectura exitosa.');
			setStage(40);

			const headersClean = aoa[0].map((h) => superClean(normalizeText(h)));
			const findCol = (keys) => {
				for (const k of keys) {
					const i = headersClean.findIndex((h) => h.includes(k));
					if (i >= 0) return i;
				}
				return -1;
			};

			let idxId = findCol(['idusuario', 'legajo']);
			if (idxId < 0) idxId = 0;
			let idxName = findCol(['nombre']);
			if (idxName < 0) idxName = 2;
			let idxTipo = findCol(['tipodeevento', 'evento']);
			if (idxTipo < 0) idxTipo = 6;

			const rows = aoa.slice(1);
			ui.k_in.textContent = rows.length;
			const groups = new Map();
			const employees = new Set();
			const errLog = [['ID Usuario', 'Fecha', 'Detalle']];

			for (let i = 0; i < rows.length; i++) {
				const r = rows[i];
				const type = classifyEvent(r[idxTipo]);
				if (!type) continue;
				const id = normalizeId(r[idxId]);
				if (!id) continue;
				const dParts = parseDateString(r[FIXED_DATE_COL]);
				if (!dParts) continue;
				const secs = parseTimeSeconds(r[FIXED_TIME_COL]);
				if (secs == null) continue;
				if (r[idxName]) employees.add(r[idxName]);
				const k = `${id}|${dateKey(dParts)}`;
				if (!groups.has(k))
					groups.set(k, {
						id,
						dateParts: dParts,
						baseData: [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => r[idx] || ''),
						inSec: null,
						outSec: null,
						merged: false,
					});
				const g = groups.get(k);
				if (type === 'IN') {
					if (g.inSec === null || secs < g.inSec) g.inSec = secs;
				} else {
					if (g.outSec === null || secs > g.outSec) g.outSec = secs;
				}
			}
			ui.k_emp.textContent = employees.size;
			setStage(70);

			let list = Array.from(groups.values()).sort((a, b) =>
				a.id !== b.id ? (a.id < b.id ? -1 : 1) : dateScore(a.dateParts) - dateScore(b.dateParts),
			);
			let fixCount = 0;
			for (let i = 0; i < list.length - 1; i++) {
				const curr = list[i],
					next = list[i + 1];
				if (curr.id !== next.id || !isNextDay(curr.dateParts, next.dateParts)) continue;
				if (curr.inSec != null && curr.outSec == null && next.outSec != null && next.inSec == null) {
					const dur = 86400 - curr.inSec + next.outSec;
					if (dur / 3600 > 20) continue;
					curr.outSec = next.outSec;
					next.merged = true;
					fixCount++;
					errLog.push([curr.id, dateKey(curr.dateParts), 'INFO: Fusión Turno Noche aplicada']);
				}
			}
			ui.k_merged.textContent = fixCount;
			list = list.filter((g) => !g.merged);
			setStage(90);

			const outData = [
				[
					'ID Usuario',
					'Legajo',
					'Nombre',
					'Cargo',
					'Función',
					'Disciplina',
					'Reporta a',
					'Ubicación',
					'Fecha',
					'Llegada',
					'Salida',
					'Inconsistencia',
				],
			];
			let errCount = 0;
			for (const g of list) {
				const errs = [];
				if (g.inSec == null) errs.push('Falta Llegada');
				if (g.outSec == null) errs.push('Falta Salida');
				if (errs.length > 0) {
					errCount++;
					errLog.push([g.id, dateKey(g.dateParts), `ERROR: ${errs.join(', ')}`]);
				}
				outData.push([
					...g.baseData,
					{
						v: new Date(Date.UTC(g.dateParts.y, g.dateParts.m - 1, g.dateParts.d, 12)),
						t: 'd',
						z: 'dd/mm/yyyy',
					},
					g.inSec == null ? '' : { v: g.inSec / 86400, t: 'n', z: 'hh:mm:ss' },
					g.outSec == null ? '' : { v: g.outSec / 86400, t: 'n', z: 'hh:mm:ss' },
					errs.join(', '),
				]);
			}
			ui.k_out.textContent = list.length;
			ui.k_errRows.textContent = errCount;
			ui.k_ok.textContent = list.length - errCount;

			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(outData), 'Refact');
			XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Original');
			XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(errLog), 'Errors & Info');
			XLSX.writeFile(wb, `Refact_V13_${state.file.name.split('.')[0]}_${nowStamp()}.xlsx`);
			setStage(100);
			setPill('ok', 'Terminado');
			log('Reporte generado.');
			ui.run.disabled = false;
		}

		// -- EVENTOS --
		ui.file.addEventListener('change', () => {
			state.file = ui.file.files[0];
			ui.run.disabled = !state.file;
			if (state.file) {
				setPill('neutral', 'Archivo cargado');
				log(`Subido: ${state.file.name}`);
			}
		});
		ui.run.addEventListener('click', () =>
			process().catch((e) => {
				log(`ERR: ${e.message}`);
				setPill('bad', 'Error');
				ui.run.disabled = false;
			}),
		);

		ui.reset.addEventListener('click', () => {
			ui.file.value = '';
			state.file = null;
			ui.run.disabled = true;
			ui.log.textContent = '';
			ui.barFill.style.width = '0%';
			[ui.k_in, ui.k_emp, ui.k_merged, ui.k_out, ui.k_ok, ui.k_errRows].forEach(
				(el) => (el.textContent = '0'),
			);
			setPill('neutral', 'Esperando Archivo');
			log('Limpieza de sistema.');
		});
	});
})();
