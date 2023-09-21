// import { Tldraw, createTLStore, defaultShapeUtils  } from '@tldraw/tldraw'
// import { throttle } from '@tldraw/utils'


// export default function Editor() {
// 	return (
// 		<div className="tldraw__editor">
// 			<Tldraw />
// 		</div>
// 	)
// }
import { Tldraw, createTLStore, defaultShapes, useEditor, useContainer, Editor, } from '@tldraw/tldraw'
import { useValue } from '@tldraw/state'
import { throttle } from '@tldraw/utils'
import '@tldraw/tldraw/tldraw.css'
import { useLayoutEffect, useState, useEffect, useContext } from 'react'
 import {
	EMBED_DEFINITIONS,
	LANGUAGES,
	defaultEditorAssetUrls,
	TLEditorAssetUrls
  } from "@tldraw/editor";
  
 


const PERSISTENCE_KEY = document.title
const iconTypes = [
	"align-bottom-center",
	"align-bottom-left",
	"align-bottom-right",
	"align-bottom",
	"align-center-center",
	"align-center-horizontal",
	"align-center-left",
	"align-center-right",
	"align-center-vertical",
	"align-left",
	"align-right",
	"align-top-center",
	"align-top-left",
	"align-top-right",
	"align-top",
	"arrow-left",
	"arrowhead-arrow",
	"arrowhead-bar",
	"arrowhead-diamond",
	"arrowhead-dot",
	"arrowhead-none",
	"arrowhead-square",
	"arrowhead-triangle-inverted",
	"arrowhead-triangle",
	"aspect-ratio",
	"avatar",
	"blob",
	"bring-forward",
	"bring-to-front",
	"check",
	"checkbox-checked",
	"checkbox-empty",
	"chevron-down",
	"chevron-left",
	"chevron-right",
	"chevron-up",
	"chevrons-ne",
	"chevrons-sw",
	"clipboard-copied",
	"clipboard-copy",
	"code",
	"collab",
	"color",
	"comment",
	"cross-2",
	"cross",
	"dash-dashed",
	"dash-dotted",
	"dash-draw",
	"dash-solid",
	"discord",
	"distribute-horizontal",
	"distribute-vertical",
	"dot",
	"dots-horizontal",
	"dots-vertical",
	"drag-handle-dots",
	"duplicate",
	"edit",
	"external-link",
	"file",
	"fill-none",
	"fill-pattern",
	"fill-semi",
	"fill-solid",
	"follow",
	"following",
	"font-draw",
	"font-mono",
	"font-sans",
	"font-serif",
	"geo-arrow-down",
	"geo-arrow-left",
	"geo-arrow-right",
	"geo-arrow-up",
	"geo-check-box",
	"geo-diamond",
	"geo-ellipse",
	"geo-hexagon",
	"geo-octagon",
	"geo-oval",
	"geo-pentagon",
	"geo-rectangle",
	"geo-rhombus-2",
	"geo-rhombus",
	"geo-star",
	"geo-trapezoid",
	"geo-triangle",
	"geo-x-box",
	"github",
	"group",
	"hidden",
	"image",
	"info-circle",
	"leading",
	"link",
	"lock-small",
	"lock",
	"menu",
	"minus",
	"mixed",
	"pack",
	"page",
	"plus",
	"question-mark-circle",
	"question-mark",
	"redo",
	"reset-zoom",
	"rotate-ccw",
	"rotate-cw",
	"ruler",
	"search",
	"send-backward",
	"send-to-back",
	"settings-horizontal",
	"settings-vertical-1",
	"settings-vertical",
	"share-1",
	"share-2",
	"size-extra-large",
	"size-large",
	"size-medium",
	"size-small",
	"spline-cubic",
	"spline-line",
	"stack-horizontal",
	"stack-vertical",
	"stretch-horizontal",
	"stretch-vertical",
	"text-align-center",
	"text-align-justify",
	"text-align-left",
	"text-align-right",
	"tool-arrow",
	"tool-embed",
	"tool-eraser",
	"tool-frame",
	"tool-hand",
	"tool-highlight",
	"tool-laser",
	"tool-line",
	"tool-media",
	"tool-note",
	"tool-pencil",
	"tool-pointer",
	"tool-text",
	"trash",
	"triangle-down",
	"triangle-up",
	"twitter",
	"undo",
	"ungroup",
	"unlock-small",
	"unlock",
	"vertical-align-center",
	"vertical-align-end",
	"vertical-align-start",
	"visible",
	"warning-triangle",
	"zoom-in",
	"zoom-out"
  ];
export default function PersistenceExample()  {
	const [store] = useState(() => createTLStore({ shapes: defaultShapes }))
	let editorUrls: TLEditorAssetUrls = {
		...defaultEditorAssetUrls,
		fonts: {
			monospace: './public/assets/fonts/IBMPlexMono-Medium.woff2',
			serif: './public/assets/fonts/IBMPlexSerif-Medium.woff2',
			sansSerif: './public/assets/fonts/IBMPlexSans-Medium.woff2',
			draw: './public/assets/fonts/Shantell_Sans-Normal-SemiBold.woff2',
		}
	}
	let defaultUiAssetUrls = {
		...editorUrls,
		icons: Object.fromEntries(
		  iconTypes.map((name) => [
			name,
			`./public/assets/icons/icon/${name}.svg`
		  ])
		),
		translations: Object.fromEntries(
		  LANGUAGES.map((lang) => [
			lang.locale,
			`./public/assets/translations/${lang.locale}.json`
		  ])
		),
		embedIcons: Object.fromEntries(
		  EMBED_DEFINITIONS.map((def) => [
			def.type,
			`./public/assets/embed-icons/${def.type}.png`
		  ])
		)
	  };
	const [loadingState, setLoadingState] = useState<
		{ status: 'loading' } | { status: 'ready' } | { status: 'error'; error: string }
	>({
		status: 'loading',
	})
	useLayoutEffect(() => {
		setLoadingState({ status: 'loading' })

		// Get persisted data from local storage
		const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY)

		if (persistedSnapshot) {
			try {
				const snapshot = JSON.parse(persistedSnapshot)
				store.loadSnapshot(snapshot)
				setLoadingState({ status: 'ready' })
			} catch (error: any) {
				setLoadingState({ status: 'error', error: error.message }) // Something went wrong
			}
		} else {
			setLoadingState({ status: 'ready' }) // Nothing persisted, continue with the empty store
		}

		// Each time the store changes, run the (debounced) persist function
		const cleanupFn = store.listen(
			throttle(() => {
				const snapshot = store.getSnapshot()
				localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot))
			}, 500)
		)

		return () => {
			cleanupFn()
		}
	}, [store])

	if (loadingState.status === 'loading') {
		return (
			<div className="tldraw__editor">
				<h2>Loading...</h2>
			</div>
		)
	}

	if (loadingState.status === 'error') {
		return (
			<div className="tldraw__editor">
				<h2>Error!</h2>
				<p>{loadingState.error}</p>
			</div>
		)
	}

	return (
		<div className={"tldraw__editor"}>
			<Tldraw assetUrls={defaultUiAssetUrls} onMount={(editor)=> {
				  window.addEventListener("setLightMode", (e)=> {
					console.log("listening")
					  editor.setDarkMode(false)
				  })
				  window.addEventListener("setDarkMode", (e) => {
					 editor.setDarkMode(true)
				  })
			     
			}}  store={store} autoFocus>
				
			</Tldraw>
		</div>
	)
}
