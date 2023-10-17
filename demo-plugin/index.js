export function init (extensionPoints) {
  
  // varFromExtensionPoint 从app传来的变量
  const yourCustomExtension = (varFromExtensionPoint) => {
    console.log('yourCustomExtension',varFromExtensionPoint)
  }

// app 是应用暴露的api集合
 extensionPoints.register( 'app', 'model-viewer', yourCustomExtension )
}