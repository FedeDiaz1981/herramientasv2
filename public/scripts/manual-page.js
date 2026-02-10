(() => {
	window.addEventListener('load', () => {
		if (window.lucide?.createIcons) {
			window.lucide.createIcons();
		}

		const downloadBtn = document.getElementById('btnDownloadPage');
		if (!downloadBtn) return;

		downloadBtn.addEventListener('click', () => {
			const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'Manual_Usuario_TimeTracking_V13.html';
			a.click();
		});
	});
})();
