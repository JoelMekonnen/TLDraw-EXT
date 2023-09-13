
// the interface for holding important session information
interface TLPropInterface {
     windowObject: ext.windows.Window | null,
     tabObject: ext.tabs.Tab | null,
     webviewObject: ext.webviews.Webview |  null,
     isCreated: boolean
}
class TLProps implements TLPropInterface {
        constructor(public windowObject: ext.windows.Window | null, public tabObject: ext.tabs.Tab | null, public webviewObject: ext.webviews.Webview | null, public isCreated:boolean  ){}
}
// Global resources
let created = false
let tab: ext.tabs.Tab | null = null
let windows: ext.windows.Window | null = null
let webview: ext.webviews.Webview | null = null
let tlPropArray: TLProps[] = []  // the array of windows to hold window data // the number of windows created so far
let windowsCount: number = 0
let isFound: boolean = false;
let foundIndex:number = -1;
let websession: ext.websessions.Websession  | null = null
// Extension clicked

ext.runtime.onExtensionClick.addListener(async () => {
  try {   
    // if the length of the tlprop array is 0 it means no tabs is created
   
    if(tlPropArray.length > 0) {
            for(let i = 0; i < tlPropArray.length; i++)
            {
                if(!tlPropArray[i].isCreated)
                {
                    foundIndex = i
                    isFound = true;  
                    break;
                }
            }
            // if the we don't find an empty spot, increment the count
            if(!isFound)
            {
                windowsCount = windowsCount + 1
            }
        } else {
            windowsCount = windowsCount + 1
        }
   
    // creatng the window
    windows = await ext.windows.create({
      title: `TLDraw #${isFound ? foundIndex+1 : windowsCount}`,
      icon: 'icons/icon-1024.png',
      fullscreenable: true,
      vibrancy: false,
      frame: true,
    })
    // Create tab
    tab =  await ext.tabs.create({
      icon: 'icons/icon-1024.png',
      text: `TLDraw #${isFound ? foundIndex + 1 : windowsCount}`,
      muted: true,
      mutable: false,
      closable: true,
    })
    // Create the websession
    websession = await ext.websessions.create({
           partition: `TLDraw ${isFound ? foundIndex + 1 : windowsCount}`,
           persistent: true,
           cache: true,
           global: false
    })
    
    const size = await ext.windows.getContentSize(windows.id)
    webview = await ext.webviews.create({
         websession: websession,
    })
    // lets first detect the intial dark or light value
    let isDarkMode = await ext.windows.getPlatformDarkMode()
    if(isDarkMode)
    {
      await ext.webviews.executeJavaScript(webview!.id, ` window.dispatchEvent(new Event('setDarkMode'))`)
    } else {
      await ext.webviews.executeJavaScript(webview!.id, ` window.dispatchEvent(new Event('setLightMode'))`)
    }
    await ext.webviews.loadFile(webview.id, 'TLDraw-folder/index.html')
    await ext.webviews.attach(webview.id, windows.id)
    await ext.webviews.setBounds(webview.id, { x: 0, y: 0, width: size.width, height: size.height })
    await ext.webviews.setAutoResize(webview.id, { width: true, height: true })
    // then lets listen for a change
    ext.windows.onUpdatedDarkMode.addListener(async (event, detail)  => {
            if(detail.platform) {
              await ext.webviews.executeJavaScript(webview!.id, ` window.dispatchEvent(new Event('setDarkMode'))`)
            } else {
              await ext.webviews.executeJavaScript(webview!.id, ` window.dispatchEvent(new Event('setLightMode'))`)
            }
    })
   
    // if an index is free to use repopulate it 
    if(isFound) {
      tlPropArray[foundIndex].tabObject = tab
      tlPropArray[foundIndex].windowObject = windows
      tlPropArray[foundIndex].webviewObject  = webview
      tlPropArray[foundIndex].isCreated = true;
       // reset it
    } else {
      // if there is no free index push it at the end
      tlPropArray.push(new TLProps(windows, tab, webview, true)) // add the prop information into the array
    } 
    isFound = false;
    foundIndex = -1
  } catch (error) {
    // Print error
    console.error('ext.runtime.onExtensionClick', JSON.stringify(error))
  }
})
// Tab was clicked
ext.tabs.onClicked.addListener(async (event) => {
  try {
      tlPropArray.forEach( async (props) => {
             if(props.tabObject!.id == event.id) {
                    await ext.windows.restore(props.windowObject!.id)
                    await ext.windows.focus(props.windowObject!.id)
             }
      })
  } catch (error) {

    // Print error
    console.error('ext.tabs.onClicked', JSON.stringify(error))

  }
})

// Tab was closed
ext.tabs.onClickedClose.addListener(async (event) => {
  try {

    tlPropArray.forEach( async (props, idx) => {
      if(props.tabObject!.id == event.id) {
             await ext.tabs.remove(props.tabObject!.id) // remove all the related information
             await ext.windows.remove(props.windowObject!.id)
             await ext.webviews.remove(props.webviewObject!.id)
             props.tabObject = null
             props.windowObject = null
             props.webviewObject  = null
             props.isCreated = false;
      
      }
    })

  } catch (error) {

    // Print error
    console.error('ext.tabs.onClickedClose', JSON.stringify(error))

  }
})



// Window was closed
ext.windows.onClosed.addListener(async (event) => {
  try {
    tlPropArray.forEach( async (props, idx) => {
      if(props.windowObject!.id == event.id) {
             await ext.tabs.remove(props.tabObject!.id)
             await ext.webviews.remove(props.webviewObject!.id)   
             props.tabObject = null
             props.windowObject = null
             props.webviewObject  = null
             props.isCreated = false;
      }
     
    })
  } catch (error) {

    // Print error
    console.error('ext.windows.onClosed', JSON.stringify(error))

  }
})

