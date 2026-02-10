(() => {
	window.addEventListener('load', () => {
		const navHome = document.getElementById('navHome');
		const navReconversion = document.getElementById('navReconversion');
		const emptyState = document.getElementById('emptyState');
		const toolReconversion = document.getElementById('toolReconversion');
		const manualModal = document.getElementById('manualModal');

		if (!navHome || !navReconversion || !emptyState || !toolReconversion) return;

		const setActive = (target) => {
			[navHome, navReconversion].forEach((btn) => {
				const isActive = btn === target;
				btn.classList.toggle('active', isActive);
				if (isActive) {
					btn.setAttribute('aria-current', 'page');
				} else {
					btn.removeAttribute('aria-current');
				}
			});
		};

		const closeManualModal = () => {
			if (!manualModal) return;
			manualModal.classList.add('hidden');
			manualModal.classList.remove('flex');
			manualModal.setAttribute('aria-hidden', 'true');
			document.body.style.overflow = '';
		};

		const showHome = () => {
			emptyState.classList.remove('hidden');
			toolReconversion.classList.add('hidden');
			setActive(navHome);
			closeManualModal();
		};

		const showReconversion = () => {
			emptyState.classList.add('hidden');
			toolReconversion.classList.remove('hidden');
			setActive(navReconversion);
		};

		navHome.addEventListener('click', showHome);
		navReconversion.addEventListener('click', showReconversion);

		showHome();
	});
})();
