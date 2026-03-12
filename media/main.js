/**
 * Webview script: renders JSON as an expand/collapse tree and handles messages from the extension.
 */
(function () {
	const treeContainer = document.getElementById('tree-container');
	const errorEl = document.getElementById('error');
	const pathEl = document.getElementById('file-path');
	const btnExpandAll = document.getElementById('btn-expand-all');
	const btnCollapseAll = document.getElementById('btn-collapse-all');

	function showError(msg) {
		errorEl.textContent = msg;
		errorEl.classList.remove('hidden');
		treeContainer.innerHTML = '';
	}

	function hideError() {
		errorEl.classList.add('hidden');
	}

	function escapeHtml(str) {
		const div = document.createElement('div');
		div.textContent = str;
		return div.innerHTML;
	}

	function getPreview(val, maxLen = 60) {
		if (val === null) return 'null';
		if (typeof val === 'boolean') return val ? 'true' : 'false';
		if (typeof val === 'number') return String(val);
		if (typeof val === 'string') {
			const s = val.replace(/"/g, '\\"');
			return s.length <= maxLen ? '"' + s + '"' : '"' + s.slice(0, maxLen) + '..."';
		}
		if (Array.isArray(val)) return '[' + val.length + ']';
		if (typeof val === 'object') return '{' + Object.keys(val).length + '}';
		return '';
	}

	function getValueClass(val) {
		if (val === null) return 'value-null';
		if (typeof val === 'boolean') return 'value-boolean';
		if (typeof val === 'number') return 'value-number';
		if (typeof val === 'string') return 'value-string';
		if (Array.isArray(val)) return 'preview array';
		if (typeof val === 'object') return 'preview object';
		return '';
	}

	function renderValue(val) {
		if (val === null) return '<span class="value-null">null</span>';
		if (typeof val === 'boolean') return '<span class="value-boolean">' + val + '</span>';
		if (typeof val === 'number') return '<span class="value-number">' + val + '</span>';
		if (typeof val === 'string') return '<span class="value-string">"' + escapeHtml(val) + '"</span>';
		return '';
	}

	function buildTree(data, expandAll) {
		function node(key, value, depth) {
			const isArray = Array.isArray(value);
			const isObject = !isArray && value !== null && typeof value === 'object';
			const hasChildren = isArray ? value.length > 0 : isObject && Object.keys(value).length > 0;
			const keyPart = key !== null ? '<span class="key">' + escapeHtml(key) + '</span>' : '';

			let childrenHtml = '';
			if (isArray && hasChildren) {
				childrenHtml = value.map((v, i) => node(String(i), v, depth + 1)).join('');
			} else if (isObject && hasChildren) {
				childrenHtml = Object.keys(value).map((k) => node(k, value[k], depth + 1)).join('');
			}

			const collapsed = expandAll ? '' : ' collapsed';
			const childrenCollapsed = expandAll ? '' : ' collapsed';

			if (hasChildren) {
				const iconText = isArray ? '[]' : '{}';
				return (
					'<li class="tree-node" data-depth="' +
					depth +
					'">' +
					'<div class="tree-node-inner">' +
					'<span class="toggle' +
					(expandAll ? '' : ' collapsed') +
					'" role="button" tabindex="0" aria-label="Toggle"></span>' +
					'<span class="node-icon ' +
					(isArray ? 'array' : 'object') +
					'">' +
					iconText +
					'</span>' +
					keyPart +
					'</div>' +
					'<ul class="tree-children' +
					childrenCollapsed +
					'">' +
					childrenHtml +
					'</ul></li>'
				);
			}

			const valHtml = renderValue(value);
			return (
				'<li class="tree-node" data-depth="' +
				depth +
				'">' +
				'<div class="tree-node-inner">' +
				'<span class="toggle empty"></span>' +
				keyPart +
				'<span class="' +
				getValueClass(value) +
				'">' +
				(valHtml || getPreview(value)) +
				'</span></div></li>'
			);
		}

		const isArray = Array.isArray(data);
		const isObject = !isArray && data !== null && typeof data === 'object';
		if (!isArray && !isObject) {
			return '<ul class="tree-node"><li class="tree-node-inner">' + renderValue(data) + '</li></ul>';
		}
		const iconText = isArray ? '[]' : '{}';
		const children = isArray
			? data.map((v, i) => node(String(i), v, 0)).join('')
			: Object.keys(data).map((k) => node(k, data[k], 0)).join('');
		const rootCollapsed = expandAll ? '' : ' collapsed';
		return (
			'<ul class="tree-node">' +
			'<li class="tree-node">' +
			'<div class="tree-node-inner">' +
			'<span class="toggle' +
			(expandAll ? '' : ' collapsed') +
			'" role="button" tabindex="0" aria-label="Toggle"></span>' +
			'<span class="node-icon root">' +
			iconText +
			'</span>' +
			'<span class="key">JSON</span>' +
			'</div>' +
			'<ul class="tree-children' +
			rootCollapsed +
			'">' +
			children +
			'</ul></li></ul>'
		);
	}

	function bindToggles(expandAll) {
		treeContainer.querySelectorAll('.toggle:not(.empty)').forEach((el) => {
			el.addEventListener('click', function (e) {
				e.stopPropagation();
				const ul = this.closest('.tree-node')?.querySelector(':scope > .tree-children');
				if (ul) {
					ul.classList.toggle('collapsed');
					this.classList.toggle('collapsed');
				}
			});
			el.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.click();
				}
			});
		});
	}

	function render(text, expandAll) {
		expandAll = expandAll === true;
		hideError();
		let data;
		try {
			data = JSON.parse(text);
		} catch (e) {
			showError('Invalid JSON: ' + e.message);
			return;
		}
		treeContainer.innerHTML = buildTree(data, expandAll);
		bindToggles(expandAll);
	}

	btnExpandAll.addEventListener('click', () => {
		const text = window.__lastJsonText;
		if (text != null) render(text, true);
	});

	btnCollapseAll.addEventListener('click', () => {
		const text = window.__lastJsonText;
		if (text != null) render(text, false);
	});

	window.addEventListener('message', (event) => {
		const msg = event.data;
		if (msg.type === 'setJson') {
			window.__lastJsonText = msg.text;
			if (msg.uri) {
				try {
					pathEl.textContent = decodeURIComponent(new URL(msg.uri).pathname).replace(/^\/([a-z]:)/i, '$1');
				} catch (_) {
					pathEl.textContent = msg.uri;
				}
			}
			render(msg.text, false);
		} else if (msg.type === 'update') {
			// File changed on disk; extension re-sends setJson when content is sent again
		}
	});
})();
