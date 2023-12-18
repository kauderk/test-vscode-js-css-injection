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

      const id = 'vscode-custom-css'
      const isTrue = () => localStorage.getItem(id) === 'true'
      function applyCustomCss(on: boolean) {
        const styles =
          document.getElementById(id) ?? document.createElement('style')
        styles.id = id
        span.style.fontWeight = on ? 'bold' : 'normal'
        // span.style.backgroundColor = on ? '#ff0000' : 'transparent'

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
      }
      // FIXME: figure out why this runs twice sometimes
      applyCustomCss(isTrue())

      // Toggle
      e.onclick = () => {
        const on = isTrue()
        applyCustomCss(on)
        localStorage.setItem(id, String(!on))
      }

      // @ts-ignore
      if (!window.onloadCustomCssJsIndicatorInterval) {
        // @ts-ignore
        window.onloadCustomCssJsIndicatorInterval = true
        console.log('window vscode-custom-css is active!')
      }
    }
  }

  // @ts-ignore
  if (window.customCssJsIndicatorInterval) {
    // @ts-ignore
    clearInterval(window.customCssJsIndicatorInterval)
  }
  // @ts-ignore
  window.customCssJsIndicatorInterval = setInterval(patch, 5000)
})()
