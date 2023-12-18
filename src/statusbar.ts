/* eslint-env browser */
;(function () {
  function patch() {
    const e1 = document.querySelector('.right-items')
    const e2 = document.querySelector(
      '.right-items .__CUSTOM_CSS_JS_INDICATOR_CLS'
    )
    if (e1 && !e2) {
      let e = document.createElement('div')
      e.id = 'be5invis.vscode-custom-css'
      e.title = 'Custom CSS and JS'
      e.className = 'statusbar-item right __CUSTOM_CSS_JS_INDICATOR_CLS'
      const span = document.createElement('span')
      {
        const a = document.createElement('a')
        a.tabIndex = -1
        a.className = 'statusbar-item-label'
        {
          span.className = 'codicon codicon-paintcan'
          a.appendChild(span)
        }
        e.appendChild(a)
      }
      e1.appendChild(e)

      let on = localStorage.getItem('vscode-custom-css') === 'true'
      e.onclick = () => {
        const id = 'vscode-custom-css'
        const styles =
          document.getElementById(id) ?? document.createElement('style')
        styles.id = id
        span.style.fontWeight = on ? 'bold' : 'normal'
        styles.innerHTML = on
          ? `
				.view-lines {
					--r: transparent;
				}
				.view-lines:has(.mtk14:hover) {
					--r: red;
				}
				.mtk14 {
					color: var(--r);
				}
				`
          : ''
        document.body.appendChild(styles)
        on = !on
        localStorage.setItem('vscode-custom-css', String(on))
      }
    }
  }
  setInterval(patch, 5000)
})()
