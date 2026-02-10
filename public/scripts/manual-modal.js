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
		const blob = new Blob([document.getElementById('manualModal').outerHTML], {
			type: 'text/html',
		});
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'Manual_Usuario_TimeTracking_V13.html';
		a.click();
	});
})();
