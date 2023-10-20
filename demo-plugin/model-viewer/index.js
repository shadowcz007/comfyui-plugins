


export function init (extensionPoints) {
 
// 定义要加载的 URL
const url = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
const isHas=Array.from(document.querySelectorAll('script'),s=>s.src===url?s.src:null).filter(f=>f)[0]
  if(!isHas){
    // 加载 URL 的 JavaScript 代码并注入到渲染进程中
    window.electron.executeJavaScript(`
    (()=>{
      const script = document.createElement('script');
          script.src = '${url}';
          script.setAttribute("type","module");
          document.body.appendChild(script);
          return true
    })()
    `)
    .then(() => {
      console.log('Script injected successfully');

      window.electron.executeJavaScript(`
      (()=>{
        const div = document.createElement('div');
            div.innerHTML=\` <model-viewer
            style="width: 200px;height: 200px"
            // camera-controls
            // disable-zoom
            // touch-action="pan-y" 
            alt="A 3D model of a sphere"
            src="https://modelviewer.dev/shared-assets/models/reflective-sphere.gltf">
        </model-viewer>
        \`
            document.body.appendChild(div);
            return true
      })()
      `)
    })
    .catch((error) => {
      console.error('Failed to inject script:', error);
    });
  }

  // varFromExtensionPoint 从app传来的变量
  const yourCustomExtension = (varFromExtensionPoint) => {
    console.log('yourCustomExtension',varFromExtensionPoint)
  }

// app 是应用暴露的api集合
 extensionPoints.register( 'app', 'model-viewer', yourCustomExtension )
}