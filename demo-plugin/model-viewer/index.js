export function init (extensionPoints) {
  // varFromExtensionPoint 从app传来的变量
  console.log(extensionPoints)
  const main = async varFromExtensionPoint => {
    console.log('yourCustomExtension', varFromExtensionPoint)


    async function loadScript (url,type='module') {
      const isHas = Array.from(document.querySelectorAll('script'), s =>
        s.src === url ? s.src : null
      ).filter(f => f)[0]
      if (!isHas) {
        // 加载 URL 的 JavaScript 代码并注入到渲染进程中
        await window.electron.executeJavaScript(
          `
    (()=>{
      const script = document.createElement('script');
          script.src = '${url}';
          script.setAttribute("type","${type}");
          document.body.appendChild(script);
          return true
    })();
    `
        )
      }
    };


    // // react 
    // await loadScript('https://unpkg.com/react@18.2.0/umd/react.production.min.js','text/javascript')
    // await loadScript('https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js','text/javascript')
    // await loadScript('https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.production.min.js','text/javascript')

    // await window.electron.executeJavaScript(`
    // (()=>{
    //   const div = document.createElement('div');
    //       div.innerHTML=\` <div class="white-board">
    //       <h1>Excalidraw Embed Example</h1>
    //       <div id="white-board"></div>
    //     </div>
    //   \`
    //       document.body.appendChild(div);
    //       return true
    // })()
    // `)

    // await window.electron.executeJavaScript(`
    // (()=>{ 
    //       const App = () => {
    //         return React.createElement(
    //           React.Fragment,
    //           null,
    //           React.createElement(
    //             "div",
    //             {
    //               style: { height: "500px" },
    //             },
    //             React.createElement(ExcalidrawLib.Excalidraw),
    //           ),
    //         );
    //       };
    //       console.log(React,ReactDOM)
    //       const excalidrawWrapper = document.getElementById("white-board");
    //       const root = ReactDOM.createRoot(excalidrawWrapper);
    //       root.render(React.createElement(App));
    //       return true
    // })()
    // `)

  

    // 定义要加载的 URL
    // const url =
    //   'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js'
    // const isHas = Array.from(document.querySelectorAll('script'), s =>
    //   s.src === url ? s.src : null
    // ).filter(f => f)[0]
    // if (!isHas) {
    //   // 加载 URL 的 JavaScript 代码并注入到渲染进程中
    //   window.electron
    //     .executeJavaScript(
    //       `
    // (()=>{
    //   const script = document.createElement('script');
    //       script.src = '${url}';
    //       script.setAttribute("type","module");
    //       document.body.appendChild(script);
    //       return true
    // })();
    // `
    //     )
    //     .then(() => {
    //       console.log('Script injected successfully')

    //       window.electron.executeJavaScript(`
    //   (()=>{
    //     const div = document.createElement('div');
    //         div.innerHTML=\` <model-viewer
    //         style="width: 200px;height: 200px"
    //         // camera-controls
    //         // disable-zoom
    //         // touch-action="pan-y" 
    //         alt="A 3D model of a sphere"
    //         src="https://modelviewer.dev/shared-assets/models/reflective-sphere.gltf">
    //     </model-viewer>
    //     \`
    //         document.body.appendChild(div);
    //         return true
    //   })()
    //   `)
    //     })
    //     .catch(error => {
    //       console.error('Failed to inject script:', error)
    //     })
    // }
  }

  // app 是应用暴露的api集合
  extensionPoints.register('model-viewer', 'model-viewer', main)
}
