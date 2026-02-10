(() => {
	const modal = document.getElementById('manualModal');
	const openBtn = document.getElementById('btnManual');
	const closeBtn = document.getElementById('btnManualClose');
	const backBtn = document.getElementById('btnManualBack');
	const downloadBtn = document.getElementById('btnDownload');

	if (!modal || !openBtn || !closeBtn || !backBtn || !downloadBtn) return;

	let lastFocused = null;

	const open = () => {
		lastFocused = document.activeElement;
		modal.classList.remove('hidden');
		modal.classList.add('flex');
		modal.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		if (window.lucide?.createIcons) window.lucide.createIcons();
		closeBtn.focus();
	};
	const close = () => {
		modal.classList.add('hidden');
		modal.classList.remove('flex');
		modal.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
	};

	openBtn.addEventListener('click', open);
	closeBtn.addEventListener('click', close);
	backBtn.addEventListener('click', close);
	modal.addEventListener('click', (event) => {
		if (event.target === modal) close();
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !modal.classList.contains('hidden')) close();
	});

	downloadBtn.addEventListener('click', () => {
		const enablePdfMode = () => document.body.classList.add('pdf-export');
		const disablePdfMode = () => document.body.classList.remove('pdf-export');
		const clearBreaks = (root) => {
			root.querySelectorAll('.pdf-break-before').forEach((el) => el.classList.remove('pdf-break-before'));
		};
		const getPageHeightPx = (contentWidth) => {
			const { jsPDF } = window.jspdf || {};
			if (!jsPDF) return contentWidth * (277 / 190);
			const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 10;
			const usableWidth = pageWidth - margin * 2;
			const usableHeight = pageHeight - margin * 2;
			return contentWidth * (usableHeight / usableWidth);
		};
		const injectBreaks = (root) => {
			clearBreaks(root);
			const rows = Array.from(root.querySelectorAll('.manual-row'));
			if (!rows.length) return;
			const rootRect = root.getBoundingClientRect();
			const contentWidth = rootRect.width || root.clientWidth;
			const pageHeight = getPageHeightPx(contentWidth);
			const buffer = 48;

			rows.forEach((row, index) => {
				const rect = row.getBoundingClientRect();
				const top = rect.top - rootRect.top;
				const height = rect.height;
				const pageTop = Math.floor(top / pageHeight) * pageHeight;
				const remaining = pageTop + pageHeight - top;
				if (index > 0 && height + buffer > remaining) row.classList.add('pdf-break-before');
			});
		};

		if (!window.html2pdf) {
			enablePdfMode();
			window.print();
			window.setTimeout(disablePdfMode, 1000);
			return;
		}
		const manualShell = modal.querySelector('.manual-shell');
		if (!manualShell) return;

		enablePdfMode();
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				injectBreaks(manualShell);
				window
					.html2pdf()
					.set({
						margin: [10, 10, 10, 10],
						filename: 'Manual_Usuario_TimeTracking_V13.pdf',
						image: { type: 'jpeg', quality: 0.98 },
						html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
						jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
						pagebreak: {
							mode: ['css', 'legacy'],
							before: '.pdf-break-before, .pdf-break-force',
							avoid: ['.manual-row', '.manual-card', '.info-box'],
						},
					})
					.from(manualShell)
					.save()
					.then(() => {
						clearBreaks(manualShell);
						disablePdfMode();
					})
					.catch(() => {
						clearBreaks(manualShell);
						disablePdfMode();
					});
			}),
		);
	});
})();
