/**
 * 这一文件由 tools/build-vendor.mjs 生成,**不要手改**。
 * 它把 @xyflow/react(12.11.6)的 CJS 体声明成**同一脚本作用域里的一个函数**,
 * 主文件(client.js)的工厂闭包直接调它。
 *
 * 为什么不用「注册成模块行」:模块系统的 `require` 只认**平台种子字**与**启动图里的行**,
 * 而一个运行时动态 `load()` 的行不在启动图里——那正是「图组件不可用」那次的原因。
 * 声明成函数就绕开了整张表:它的 `require('react')` 绑定到调用方传进来的那个 require
 * (也就是宿主给工厂的那个),所以依赖面依然只有种子字。
 */
function __clearaiXyflow(require) {
	/** 样式只注入一次(这个函数可能被重新求值,幂等要有保证)。 */
	if (typeof document !== 'undefined' && document.querySelector('style[data-clearai="xyflow"]') === null) {
		const style = document.createElement('style')
		style.setAttribute('data-clearai', 'xyflow')
		style.textContent = "/* this gets exported as style.css and can be used for the default theming */\n/* these are the necessary styles for React/Svelte Flow, they get used by base.css and style.css */\n.react-flow {\n  direction: ltr;\n\n  --xy-edge-stroke-default: #b1b1b7;\n  --xy-edge-stroke-width-default: 1;\n  --xy-edge-stroke-selected-default: #555;\n\n  --xy-connectionline-stroke-default: #b1b1b7;\n  --xy-connectionline-stroke-width-default: 1;\n\n  --xy-attribution-background-color-default: rgba(255, 255, 255, 0.5);\n\n  --xy-minimap-background-color-default: #fff;\n  --xy-minimap-mask-background-color-default: rgba(240, 240, 240, 0.6);\n  --xy-minimap-mask-stroke-color-default: transparent;\n  --xy-minimap-mask-stroke-width-default: 1;\n  --xy-minimap-node-background-color-default: #e2e2e2;\n  --xy-minimap-node-stroke-color-default: transparent;\n  --xy-minimap-node-stroke-width-default: 2;\n\n  --xy-background-color-default: transparent;\n  --xy-background-pattern-dots-color-default: #91919a;\n  --xy-background-pattern-lines-color-default: #eee;\n  --xy-background-pattern-cross-color-default: #e2e2e2;\n  background-color: var(--xy-background-color, var(--xy-background-color-default));\n  --xy-node-color-default: inherit;\n  --xy-node-border-default: 1px solid #1a192b;\n  --xy-node-background-color-default: #fff;\n  --xy-node-group-background-color-default: rgba(240, 240, 240, 0.25);\n  --xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, 0.08);\n  --xy-node-boxshadow-selected-default: 0 0 0 0.5px #1a192b;\n  --xy-node-border-radius-default: 3px;\n\n  --xy-handle-background-color-default: #1a192b;\n  --xy-handle-border-color-default: #fff;\n\n  --xy-selection-background-color-default: rgba(0, 89, 220, 0.08);\n  --xy-selection-border-default: 1px dotted rgba(0, 89, 220, 0.8);\n\n  --xy-controls-button-background-color-default: #fefefe;\n  --xy-controls-button-background-color-hover-default: #f4f4f4;\n  --xy-controls-button-color-default: inherit;\n  --xy-controls-button-color-hover-default: inherit;\n  --xy-controls-button-border-color-default: #eee;\n  --xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, 0.08);\n\n  --xy-edge-label-background-color-default: #ffffff;\n  --xy-edge-label-color-default: inherit;\n  --xy-resize-background-color-default: #3367d9;\n}\n.react-flow.dark {\n  --xy-edge-stroke-default: #3e3e3e;\n  --xy-edge-stroke-width-default: 1;\n  --xy-edge-stroke-selected-default: #727272;\n\n  --xy-connectionline-stroke-default: #b1b1b7;\n  --xy-connectionline-stroke-width-default: 1;\n\n  --xy-attribution-background-color-default: rgba(150, 150, 150, 0.25);\n\n  --xy-minimap-background-color-default: #141414;\n  --xy-minimap-mask-background-color-default: rgba(60, 60, 60, 0.6);\n  --xy-minimap-mask-stroke-color-default: transparent;\n  --xy-minimap-mask-stroke-width-default: 1;\n  --xy-minimap-node-background-color-default: #2b2b2b;\n  --xy-minimap-node-stroke-color-default: transparent;\n  --xy-minimap-node-stroke-width-default: 2;\n\n  --xy-background-color-default: #141414;\n  --xy-background-pattern-dots-color-default: #555;\n  --xy-background-pattern-lines-color-default: #333;\n  --xy-background-pattern-cross-color-default: #333;\n  --xy-node-color-default: #f8f8f8;\n  --xy-node-border-default: 1px solid #3c3c3c;\n  --xy-node-background-color-default: #1e1e1e;\n  --xy-node-group-background-color-default: rgba(240, 240, 240, 0.25);\n  --xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, 0.08);\n  --xy-node-boxshadow-selected-default: 0 0 0 0.5px #999;\n\n  --xy-handle-background-color-default: #bebebe;\n  --xy-handle-border-color-default: #1e1e1e;\n\n  --xy-selection-background-color-default: rgba(200, 200, 220, 0.08);\n  --xy-selection-border-default: 1px dotted rgba(200, 200, 220, 0.8);\n\n  --xy-controls-button-background-color-default: #2b2b2b;\n  --xy-controls-button-background-color-hover-default: #3e3e3e;\n  --xy-controls-button-color-default: #f8f8f8;\n  --xy-controls-button-color-hover-default: #fff;\n  --xy-controls-button-border-color-default: #5b5b5b;\n  --xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, 0.08);\n\n  --xy-edge-label-background-color-default: #141414;\n  --xy-edge-label-color-default: #f8f8f8;\n}\n.react-flow__background {\n  background-color: var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));\n  pointer-events: none;\n  z-index: -1;\n}\n.react-flow__container {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n}\n.react-flow__pane {\n  z-index: 1;\n  touch-action: none;\n}\n.react-flow__pane.draggable {\n    cursor: grab;\n  }\n.react-flow__pane.dragging {\n    cursor: grabbing;\n  }\n.react-flow__pane.selection {\n    cursor: pointer;\n  }\n.react-flow__viewport {\n  transform-origin: 0 0;\n  z-index: 2;\n  pointer-events: none;\n}\n.react-flow__renderer {\n  z-index: 4;\n}\n.react-flow__selection {\n  z-index: 6;\n}\n.react-flow__nodesselection-rect:focus,\n.react-flow__nodesselection-rect:focus-visible {\n  outline: none;\n}\n.react-flow__edge-path {\n  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n  stroke-width: var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));\n  fill: none;\n}\n.react-flow__connection-path {\n  stroke: var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));\n  stroke-width: var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));\n  fill: none;\n}\n.react-flow .react-flow__edges {\n  position: absolute;\n}\n.react-flow .react-flow__edges svg {\n    overflow: visible;\n    position: absolute;\n    pointer-events: none;\n  }\n.react-flow__edge {\n  pointer-events: visibleStroke;\n}\n.react-flow__edge.selectable {\n    cursor: pointer;\n  }\n.react-flow__edge.animated path {\n    stroke-dasharray: 5;\n    animation: dashdraw 0.5s linear infinite;\n  }\n.react-flow__edge.animated path.react-flow__edge-interaction {\n    stroke-dasharray: none;\n    animation: none;\n  }\n.react-flow__edge.inactive {\n    pointer-events: none;\n  }\n.react-flow__edge.selected,\n  .react-flow__edge:focus,\n  .react-flow__edge:focus-visible {\n    outline: none;\n  }\n.react-flow__edge.selected .react-flow__edge-path,\n  .react-flow__edge.selectable:focus .react-flow__edge-path,\n  .react-flow__edge.selectable:focus-visible .react-flow__edge-path {\n    stroke: var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default));\n  }\n.react-flow__edge-textwrapper {\n    pointer-events: all;\n  }\n.react-flow__edge .react-flow__edge-text {\n    pointer-events: none;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n            user-select: none;\n  }\n/* Arrowhead marker styles - use CSS custom properties as default */\n.react-flow__arrowhead polyline {\n  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n}\n.react-flow__arrowhead polyline.arrowclosed {\n  fill: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n}\n.react-flow__connection {\n  pointer-events: none;\n}\n.react-flow__connection .animated {\n    stroke-dasharray: 5;\n    animation: dashdraw 0.5s linear infinite;\n  }\nsvg.react-flow__connectionline {\n  z-index: 1001;\n  overflow: visible;\n  position: absolute;\n}\n.react-flow__nodes {\n  pointer-events: none;\n  transform-origin: 0 0;\n}\n.react-flow__node {\n  position: absolute;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n  pointer-events: all;\n  transform-origin: 0 0;\n  box-sizing: border-box;\n  cursor: default;\n}\n.react-flow__node.selectable {\n    cursor: pointer;\n  }\n.react-flow__node.draggable {\n    cursor: grab;\n    pointer-events: all;\n  }\n.react-flow__node.draggable.dragging {\n      cursor: grabbing;\n    }\n.react-flow__nodesselection {\n  z-index: 3;\n  transform-origin: left top;\n  pointer-events: none;\n}\n.react-flow__nodesselection-rect {\n    position: absolute;\n    pointer-events: all;\n    cursor: grab;\n  }\n.react-flow__handle {\n  position: absolute;\n  pointer-events: none;\n  min-width: 5px;\n  min-height: 5px;\n  width: 6px;\n  height: 6px;\n  background-color: var(--xy-handle-background-color, var(--xy-handle-background-color-default));\n  border: 1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));\n  border-radius: 100%;\n}\n.react-flow__handle.connectingfrom {\n    pointer-events: all;\n  }\n.react-flow__handle.connectionindicator {\n    pointer-events: all;\n    cursor: crosshair;\n  }\n.react-flow__handle-bottom {\n    top: auto;\n    left: 50%;\n    bottom: 0;\n    transform: translate(-50%, 50%);\n  }\n.react-flow__handle-top {\n    top: 0;\n    left: 50%;\n    transform: translate(-50%, -50%);\n  }\n.react-flow__handle-left {\n    top: 50%;\n    left: 0;\n    transform: translate(-50%, -50%);\n  }\n.react-flow__handle-right {\n    top: 50%;\n    right: 0;\n    transform: translate(50%, -50%);\n  }\n.react-flow__edgeupdater {\n  cursor: move;\n  pointer-events: all;\n}\n.react-flow__pane.selection .react-flow__panel {\n  pointer-events: none;\n}\n.react-flow__panel {\n  position: absolute;\n  z-index: 5;\n  margin: 15px;\n}\n.react-flow__panel.top {\n    top: 0;\n  }\n.react-flow__panel.bottom {\n    bottom: 0;\n  }\n.react-flow__panel.top.center, .react-flow__panel.bottom.center {\n      left: 50%;\n      transform: translateX(-15px) translateX(-50%);\n    }\n.react-flow__panel.left {\n    left: 0;\n  }\n.react-flow__panel.right {\n    right: 0;\n  }\n.react-flow__panel.left.center, .react-flow__panel.right.center {\n      top: 50%;\n      transform: translateY(-15px) translateY(-50%);\n    }\n.react-flow__attribution {\n  font-size: 10px;\n  background: var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));\n  padding: 2px 3px;\n  margin: 0;\n}\n.react-flow__attribution a {\n    text-decoration: none;\n    color: #999;\n  }\n@keyframes dashdraw {\n  from {\n    stroke-dashoffset: 10;\n  }\n}\n.react-flow__edgelabel-renderer {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n  left: 0;\n  top: 0;\n}\n.react-flow__viewport-portal {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n.react-flow__minimap {\n  background: var(\n    --xy-minimap-background-color-props,\n    var(--xy-minimap-background-color, var(--xy-minimap-background-color-default))\n  );\n}\n.react-flow__minimap-svg {\n    display: block;\n  }\n.react-flow__minimap-mask {\n    fill: var(\n      --xy-minimap-mask-background-color-props,\n      var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default))\n    );\n    stroke: var(\n      --xy-minimap-mask-stroke-color-props,\n      var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default))\n    );\n    stroke-width: var(\n      --xy-minimap-mask-stroke-width-props,\n      var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default))\n    );\n  }\n.react-flow__minimap-node {\n    fill: var(\n      --xy-minimap-node-background-color-props,\n      var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default))\n    );\n    stroke: var(\n      --xy-minimap-node-stroke-color-props,\n      var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default))\n    );\n    stroke-width: var(\n      --xy-minimap-node-stroke-width-props,\n      var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default))\n    );\n  }\n.react-flow__background-pattern.dots {\n    fill: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default))\n    );\n  }\n.react-flow__background-pattern.lines {\n    stroke: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default))\n    );\n  }\n.react-flow__background-pattern.cross {\n    stroke: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default))\n    );\n  }\n.react-flow__controls {\n  display: flex;\n  flex-direction: column;\n  box-shadow: var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default));\n}\n.react-flow__controls.horizontal {\n    flex-direction: row;\n  }\n.react-flow__controls-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 26px;\n    width: 26px;\n    padding: 4px;\n    border: none;\n    background: var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));\n    border-bottom: 1px solid\n      var(\n        --xy-controls-button-border-color-props,\n        var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default))\n      );\n    color: var(\n      --xy-controls-button-color-props,\n      var(--xy-controls-button-color, var(--xy-controls-button-color-default))\n    );\n    cursor: pointer;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n            user-select: none;\n  }\n.react-flow__controls-button svg {\n      width: 100%;\n      max-width: 12px;\n      max-height: 12px;\n      fill: currentColor;\n    }\n.react-flow__edge.updating .react-flow__edge-path {\n      stroke: #777;\n    }\n.react-flow__edge-text {\n    font-size: 10px;\n  }\n.react-flow__node.selectable:focus,\n  .react-flow__node.selectable:focus-visible {\n    outline: none;\n  }\n.react-flow__node-input,\n.react-flow__node-default,\n.react-flow__node-output,\n.react-flow__node-group {\n  padding: 10px;\n  border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));\n  width: 150px;\n  font-size: 12px;\n  color: var(--xy-node-color, var(--xy-node-color-default));\n  text-align: center;\n  border: var(--xy-node-border, var(--xy-node-border-default));\n  background-color: var(--xy-node-background-color, var(--xy-node-background-color-default));\n}\n.react-flow__node-input.selectable:hover, .react-flow__node-default.selectable:hover, .react-flow__node-output.selectable:hover, .react-flow__node-group.selectable:hover {\n      box-shadow: var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default));\n    }\n.react-flow__node-input.selectable.selected,\n    .react-flow__node-input.selectable:focus,\n    .react-flow__node-input.selectable:focus-visible,\n    .react-flow__node-default.selectable.selected,\n    .react-flow__node-default.selectable:focus,\n    .react-flow__node-default.selectable:focus-visible,\n    .react-flow__node-output.selectable.selected,\n    .react-flow__node-output.selectable:focus,\n    .react-flow__node-output.selectable:focus-visible,\n    .react-flow__node-group.selectable.selected,\n    .react-flow__node-group.selectable:focus,\n    .react-flow__node-group.selectable:focus-visible {\n      box-shadow: var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default));\n    }\n.react-flow__node-group {\n  background-color: var(--xy-node-group-background-color, var(--xy-node-group-background-color-default));\n}\n.react-flow__nodesselection-rect,\n.react-flow__selection {\n  background: var(--xy-selection-background-color, var(--xy-selection-background-color-default));\n  border: var(--xy-selection-border, var(--xy-selection-border-default));\n}\n.react-flow__nodesselection-rect:focus,\n  .react-flow__nodesselection-rect:focus-visible,\n  .react-flow__selection:focus,\n  .react-flow__selection:focus-visible {\n    outline: none;\n  }\n.react-flow__controls-button:hover {\n      background: var(\n        --xy-controls-button-background-color-hover-props,\n        var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default))\n      );\n      color: var(\n        --xy-controls-button-color-hover-props,\n        var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default))\n      );\n    }\n.react-flow__controls-button:disabled {\n      pointer-events: none;\n    }\n.react-flow__controls-button:disabled svg {\n        fill-opacity: 0.4;\n      }\n.react-flow__controls-button:last-child {\n    border-bottom: none;\n  }\n.react-flow__controls.horizontal .react-flow__controls-button {\n    border-bottom: none;\n    border-right: 1px solid\n      var(\n        --xy-controls-button-border-color-props,\n        var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default))\n      );\n  }\n.react-flow__controls.horizontal .react-flow__controls-button:last-child {\n    border-right: none;\n  }\n.react-flow__resize-control {\n  position: absolute;\n}\n.react-flow__resize-control.left,\n.react-flow__resize-control.right {\n  cursor: ew-resize;\n}\n.react-flow__resize-control.top,\n.react-flow__resize-control.bottom {\n  cursor: ns-resize;\n}\n.react-flow__resize-control.top.left,\n.react-flow__resize-control.bottom.right {\n  cursor: nwse-resize;\n}\n.react-flow__resize-control.bottom.left,\n.react-flow__resize-control.top.right {\n  cursor: nesw-resize;\n}\n/* handle styles */\n.react-flow__resize-control.handle {\n  width: 5px;\n  height: 5px;\n  border: 1px solid #fff;\n  border-radius: 1px;\n  background-color: var(--xy-resize-background-color, var(--xy-resize-background-color-default));\n  translate: -50% -50%;\n}\n.react-flow__resize-control.handle.left {\n  left: 0;\n  top: 50%;\n}\n.react-flow__resize-control.handle.right {\n  left: 100%;\n  top: 50%;\n}\n.react-flow__resize-control.handle.top {\n  left: 50%;\n  top: 0;\n}\n.react-flow__resize-control.handle.bottom {\n  left: 50%;\n  top: 100%;\n}\n.react-flow__resize-control.handle.top.left {\n  left: 0;\n}\n.react-flow__resize-control.handle.bottom.left {\n  left: 0;\n}\n.react-flow__resize-control.handle.top.right {\n  left: 100%;\n}\n.react-flow__resize-control.handle.bottom.right {\n  left: 100%;\n}\n/* line styles */\n.react-flow__resize-control.line {\n  border-color: var(--xy-resize-background-color, var(--xy-resize-background-color-default));\n  border-width: 0;\n  border-style: solid;\n}\n.react-flow__resize-control.line.left,\n.react-flow__resize-control.line.right {\n  width: 1px;\n  transform: translate(-50%, 0);\n  top: 0;\n  height: 100%;\n}\n.react-flow__resize-control.line.left {\n  left: 0;\n  border-left-width: 1px;\n}\n.react-flow__resize-control.line.right {\n  left: 100%;\n  border-right-width: 1px;\n}\n.react-flow__resize-control.line.top,\n.react-flow__resize-control.line.bottom {\n  height: 1px;\n  transform: translate(0, -50%);\n  left: 0;\n  width: 100%;\n}\n.react-flow__resize-control.line.top {\n  top: 0;\n  border-top-width: 1px;\n}\n.react-flow__resize-control.line.bottom {\n  border-bottom-width: 1px;\n  top: 100%;\n}\n.react-flow__edge-textbg {\n  fill: var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default));\n}\n.react-flow__edge-text {\n  fill: var(--xy-edge-label-color, var(--xy-edge-label-color-default));\n}\n"
		document.head.appendChild(style)
	}
	var module = { exports: {} }
	var exports = module.exports
	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
"use client";var nu=Object.create;var mn=Object.defineProperty;var ou=Object.getOwnPropertyDescriptor;var ru=Object.getOwnPropertyNames;var iu=Object.getPrototypeOf,su=Object.prototype.hasOwnProperty;var gt=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}},au=(e,t)=>{for(var n in t)mn(e,n,{get:t[n],enumerable:!0})},Mr=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of ru(t))!su.call(e,r)&&r!==n&&mn(e,r,{get:()=>t[r],enumerable:!(o=ou(t,r))||o.enumerable});return e};var vo=(e,t,n)=>(n=e!=null?nu(iu(e)):{},Mr(t||!e||!e.__esModule?mn(n,"default",{value:e,enumerable:!0}):n,e)),cu=e=>Mr(mn({},"__esModule",{value:!0}),e);var wa=gt(xa=>{"use strict";var Pt=require("react");function rh(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ih=typeof Object.is=="function"?Object.is:rh,sh=Pt.useState,ah=Pt.useEffect,ch=Pt.useLayoutEffect,lh=Pt.useDebugValue;function uh(e,t){var n=t(),o=sh({inst:{value:n,getSnapshot:t}}),r=o[0].inst,i=o[1];return ch(function(){r.value=n,r.getSnapshot=t,ar(r)&&i({inst:r})},[e,n,t]),ah(function(){return ar(r)&&i({inst:r}),e(function(){ar(r)&&i({inst:r})})},[e]),lh(n),n}function ar(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!ih(e,n)}catch{return!0}}function dh(e,t){return t()}var fh=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?dh:uh;xa.useSyncExternalStore=Pt.useSyncExternalStore!==void 0?Pt.useSyncExternalStore:fh});var ba=gt((lb,va)=>{"use strict";va.exports=wa()});var Sa=gt(Ea=>{"use strict";var co=require("react"),hh=ba();function ph(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var gh=typeof Object.is=="function"?Object.is:ph,mh=hh.useSyncExternalStore,yh=co.useRef,xh=co.useEffect,wh=co.useMemo,vh=co.useDebugValue;Ea.useSyncExternalStoreWithSelector=function(e,t,n,o,r){var i=yh(null);if(i.current===null){var s={hasValue:!1,value:null};i.current=s}else s=i.current;i=wh(function(){function c(h){if(!l){if(l=!0,u=h,h=o(h),r!==void 0&&s.hasValue){var p=s.value;if(r(p,h))return f=p}return f=h}if(p=f,gh(u,h))return p;var v=o(h);return r!==void 0&&r(p,v)?(u=h,p):(u=h,f=v)}var l=!1,u,f,d=n===void 0?null:n;return[function(){return c(t())},d===null?void 0:function(){return c(d())}]},[t,n,o,r]);var a=mh(e,i[0],i[1]);return xh(function(){s.hasValue=!0,s.value=a},[a]),vh(a),a}});var Ca=gt((db,_a)=>{"use strict";_a.exports=Sa()});var za=gt(de=>{"use strict";var _h=require("react");function Ta(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Ke(){}var me={d:{f:Ke,r:function(){throw Error(Ta(522))},D:Ke,C:Ke,L:Ke,m:Ke,X:Ke,S:Ke,M:Ke},p:0,findDOMNode:null},Ch=Symbol.for("react.portal"),Nh=Symbol.for("react.recoverable"),Oa=Symbol.for("react.optimistic_key");function Mh(e,t,n){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Ch,key:o==null?null:o===Oa?Oa:""+o,children:e,containerInfo:t,implementation:n}}var dn=_h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function lo(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}de.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=me;de.browser=function(e){return{$$typeof:Nh,_reason:e}};de.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Ta(299));return Mh(e,t,null,n)};de.flushSync=function(e){var t=dn.T,n=me.p;try{if(dn.T=null,me.p=2,e)return e()}finally{dn.T=t,me.p=n,me.d.f()}};de.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,me.d.C(e,t))};de.prefetchDNS=function(e){typeof e=="string"&&me.d.D(e)};de.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,o=lo(n,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,i=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?me.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:o,integrity:r,fetchPriority:i}):n==="script"&&me.d.X(e,{crossOrigin:o,integrity:r,fetchPriority:i,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};de.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=lo(t.as,t.crossOrigin);me.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&me.d.M(e)};de.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,o=lo(n,t.crossOrigin);me.d.L(e,n,{crossOrigin:o,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};de.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=lo(t.as,t.crossOrigin);me.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else me.d.m(e)};de.requestFormReset=function(e){me.d.r(e)};de.unstable_batchedUpdates=function(e,t){return e(t)};de.useFormState=function(e,t,n){return dn.H.useFormState(e,t,n)};de.useFormStatus=function(){return dn.H.useHostTransitionStatus()};de.version="19.3.0"});var Ha=gt((yb,Ra)=>{"use strict";function $a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE($a)}catch(e){console.error(e)}}$a(),Ra.exports=za()});var gm={};au(gm,{Background:()=>$g,BackgroundVariant:()=>Be,BaseEdge:()=>gn,BezierEdge:()=>Vc,ConnectionLineType:()=>Ce,ConnectionMode:()=>Le,ControlButton:()=>fn,Controls:()=>Xg,EdgeLabelRenderer:()=>Gc,EdgeText:()=>Ic,EdgeToolbar:()=>pm,Handle:()=>hn,MarkerType:()=>lt,MiniMap:()=>nm,MiniMapNode:()=>Qc,NodeResizeControl:()=>hr,NodeResizer:()=>sm,NodeToolbar:()=>fm,PanOnScrollMode:()=>ke,Panel:()=>pn,Position:()=>Y,ReactFlow:()=>cg,ReactFlowProvider:()=>qc,ResizeControlVariant:()=>Pe,SelectionMode:()=>qe,SimpleBezierEdge:()=>Pc,SmoothStepEdge:()=>xr,StepEdge:()=>zc,StraightEdge:()=>Hc,ViewportPortal:()=>dg,addEdge:()=>mc,applyEdgeChanges:()=>gr,applyNodeChanges:()=>pr,experimental_useOnEdgesChangeMiddleware:()=>Ag,experimental_useOnNodesChangeMiddleware:()=>Pg,getBezierEdgeCenter:()=>cn,getBezierPath:()=>ln,getConnectedEdges:()=>Yo,getEdgeCenter:()=>no,getIncomers:()=>$s,getNodesBounds:()=>Kn,getOutgoers:()=>zs,getSimpleBezierPath:()=>yr,getSmoothStepPath:()=>kt,getStraightPath:()=>un,getViewportForBounds:()=>Mt,isEdge:()=>yc,isNode:()=>dr,reconnectEdge:()=>Gh,useConnection:()=>Yc,useEdges:()=>mg,useEdgesState:()=>vg,useHandleConnections:()=>Cg,useInternalNode:()=>kg,useKeyPress:()=>Dt,useNodeConnections:()=>Mg,useNodeId:()=>Ot,useNodes:()=>pg,useNodesData:()=>Ig,useNodesInitialized:()=>_g,useNodesState:()=>wg,useOnSelectionChange:()=>Eg,useOnViewportChange:()=>bg,useReactFlow:()=>go,useStore:()=>K,useStoreApi:()=>ne,useUpdateNodeInternals:()=>fg,useViewport:()=>xg});module.exports=cu(gm);var k=require("react/jsx-runtime"),_=require("react");function ie(e){if(typeof e=="string"||typeof e=="number")return""+e;let t="";if(Array.isArray(e))for(let n=0,o;n<e.length;n++)(o=ie(e[n]))!==""&&(t+=(t&&" ")+o);else for(let n in e)e[n]&&(t+=(t&&" ")+n);return t}var lu={value:()=>{}};function kr(){for(var e=0,t=arguments.length,n={},o;e<t;++e){if(!(o=arguments[e]+"")||o in n||/[\s.]/.test(o))throw new Error("illegal type: "+o);n[o]=[]}return new yn(n)}function yn(e){this._=e}function uu(e,t){return e.trim().split(/^|\s+/).map(function(n){var o="",r=n.indexOf(".");if(r>=0&&(o=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:o}})}yn.prototype=kr.prototype={constructor:yn,on:function(e,t){var n=this._,o=uu(e+"",n),r,i=-1,s=o.length;if(arguments.length<2){for(;++i<s;)if((r=(e=o[i]).type)&&(r=du(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++i<s;)if(r=(e=o[i]).type)n[r]=Ir(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Ir(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new yn(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),o=0,r,i;o<r;++o)n[o]=arguments[o+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(i=this._[e],o=0,r=i.length;o<r;++o)i[o].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var o=this._[e],r=0,i=o.length;r<i;++r)o[r].value.apply(t,n)}};function du(e,t){for(var n=0,o=e.length,r;n<o;++n)if((r=e[n]).name===t)return r.value}function Ir(e,t,n){for(var o=0,r=e.length;o<r;++o)if(e[o].name===t){e[o]=lu,e=e.slice(0,o).concat(e.slice(o+1));break}return n!=null&&e.push({name:t,value:n}),e}var je=kr;var xn="http://www.w3.org/1999/xhtml",bo={svg:"http://www.w3.org/2000/svg",xhtml:xn,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function ze(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),bo.hasOwnProperty(t)?{space:bo[t],local:e}:e}function fu(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===xn&&t.documentElement.namespaceURI===xn?t.createElement(e):t.createElementNS(n,e)}}function hu(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function wn(e){var t=ze(e);return(t.local?hu:fu)(t)}function pu(){}function et(e){return e==null?pu:function(){return this.querySelector(e)}}function Pr(e){typeof e!="function"&&(e=et(e));for(var t=this._groups,n=t.length,o=new Array(n),r=0;r<n;++r)for(var i=t[r],s=i.length,a=o[r]=new Array(s),c,l,u=0;u<s;++u)(c=i[u])&&(l=e.call(c,c.__data__,u,i))&&("__data__"in c&&(l.__data__=c.__data__),a[u]=l);return new se(o,this._parents)}function Eo(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function gu(){return[]}function zt(e){return e==null?gu:function(){return this.querySelectorAll(e)}}function mu(e){return function(){return Eo(e.apply(this,arguments))}}function Ar(e){typeof e=="function"?e=mu(e):e=zt(e);for(var t=this._groups,n=t.length,o=[],r=[],i=0;i<n;++i)for(var s=t[i],a=s.length,c,l=0;l<a;++l)(c=s[l])&&(o.push(e.call(c,c.__data__,l,s)),r.push(c));return new se(o,r)}function $t(e){return function(){return this.matches(e)}}function vn(e){return function(t){return t.matches(e)}}var yu=Array.prototype.find;function xu(e){return function(){return yu.call(this.children,e)}}function wu(){return this.firstElementChild}function Dr(e){return this.select(e==null?wu:xu(typeof e=="function"?e:vn(e)))}var vu=Array.prototype.filter;function bu(){return Array.from(this.children)}function Eu(e){return function(){return vu.call(this.children,e)}}function Or(e){return this.selectAll(e==null?bu:Eu(typeof e=="function"?e:vn(e)))}function Tr(e){typeof e!="function"&&(e=$t(e));for(var t=this._groups,n=t.length,o=new Array(n),r=0;r<n;++r)for(var i=t[r],s=i.length,a=o[r]=[],c,l=0;l<s;++l)(c=i[l])&&e.call(c,c.__data__,l,i)&&a.push(c);return new se(o,this._parents)}function bn(e){return new Array(e.length)}function zr(){return new se(this._enter||this._groups.map(bn),this._parents)}function Rt(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}Rt.prototype={constructor:Rt,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function $r(e){return function(){return e}}function Su(e,t,n,o,r,i){for(var s=0,a,c=t.length,l=i.length;s<l;++s)(a=t[s])?(a.__data__=i[s],o[s]=a):n[s]=new Rt(e,i[s]);for(;s<c;++s)(a=t[s])&&(r[s]=a)}function _u(e,t,n,o,r,i,s){var a,c,l=new Map,u=t.length,f=i.length,d=new Array(u),h;for(a=0;a<u;++a)(c=t[a])&&(d[a]=h=s.call(c,c.__data__,a,t)+"",l.has(h)?r[a]=c:l.set(h,c));for(a=0;a<f;++a)h=s.call(e,i[a],a,i)+"",(c=l.get(h))?(o[a]=c,c.__data__=i[a],l.delete(h)):n[a]=new Rt(e,i[a]);for(a=0;a<u;++a)(c=t[a])&&l.get(d[a])===c&&(r[a]=c)}function Cu(e){return e.__data__}function Rr(e,t){if(!arguments.length)return Array.from(this,Cu);var n=t?_u:Su,o=this._parents,r=this._groups;typeof e!="function"&&(e=$r(e));for(var i=r.length,s=new Array(i),a=new Array(i),c=new Array(i),l=0;l<i;++l){var u=o[l],f=r[l],d=f.length,h=Nu(e.call(u,u&&u.__data__,l,o)),p=h.length,v=a[l]=new Array(p),x=s[l]=new Array(p),m=c[l]=new Array(d);n(u,f,v,x,m,h,t);for(var b=0,g=0,w,C;b<p;++b)if(w=v[b]){for(b>=g&&(g=b+1);!(C=x[g])&&++g<p;);w._next=C||null}}return s=new se(s,o),s._enter=a,s._exit=c,s}function Nu(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function Hr(){return new se(this._exit||this._groups.map(bn),this._parents)}function Lr(e,t,n){var o=this.enter(),r=this,i=this.exit();return typeof e=="function"?(o=e(o),o&&(o=o.selection())):o=o.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?i.remove():n(i),o&&r?o.merge(r).order():r}function Br(e){for(var t=e.selection?e.selection():e,n=this._groups,o=t._groups,r=n.length,i=o.length,s=Math.min(r,i),a=new Array(r),c=0;c<s;++c)for(var l=n[c],u=o[c],f=l.length,d=a[c]=new Array(f),h,p=0;p<f;++p)(h=l[p]||u[p])&&(d[p]=h);for(;c<r;++c)a[c]=n[c];return new se(a,this._parents)}function Vr(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var o=e[t],r=o.length-1,i=o[r],s;--r>=0;)(s=o[r])&&(i&&s.compareDocumentPosition(i)^4&&i.parentNode.insertBefore(s,i),i=s);return this}function Fr(e){e||(e=Mu);function t(f,d){return f&&d?e(f.__data__,d.__data__):!f-!d}for(var n=this._groups,o=n.length,r=new Array(o),i=0;i<o;++i){for(var s=n[i],a=s.length,c=r[i]=new Array(a),l,u=0;u<a;++u)(l=s[u])&&(c[u]=l);c.sort(t)}return new se(r,this._parents).order()}function Mu(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function Xr(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function Yr(){return Array.from(this)}function Zr(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var o=e[t],r=0,i=o.length;r<i;++r){var s=o[r];if(s)return s}return null}function Wr(){let e=0;for(let t of this)++e;return e}function qr(){return!this.node()}function Gr(e){for(var t=this._groups,n=0,o=t.length;n<o;++n)for(var r=t[n],i=0,s=r.length,a;i<s;++i)(a=r[i])&&e.call(a,a.__data__,i,r);return this}function Iu(e){return function(){this.removeAttribute(e)}}function ku(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Pu(e,t){return function(){this.setAttribute(e,t)}}function Au(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function Du(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function Ou(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function Kr(e,t){var n=ze(e);if(arguments.length<2){var o=this.node();return n.local?o.getAttributeNS(n.space,n.local):o.getAttribute(n)}return this.each((t==null?n.local?ku:Iu:typeof t=="function"?n.local?Ou:Du:n.local?Au:Pu)(n,t))}function En(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function Tu(e){return function(){this.style.removeProperty(e)}}function zu(e,t,n){return function(){this.style.setProperty(e,t,n)}}function $u(e,t,n){return function(){var o=t.apply(this,arguments);o==null?this.style.removeProperty(e):this.style.setProperty(e,o,n)}}function Ur(e,t,n){return arguments.length>1?this.each((t==null?Tu:typeof t=="function"?$u:zu)(e,t,n??"")):Ve(this.node(),e)}function Ve(e,t){return e.style.getPropertyValue(t)||En(e).getComputedStyle(e,null).getPropertyValue(t)}function Ru(e){return function(){delete this[e]}}function Hu(e,t){return function(){this[e]=t}}function Lu(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function Qr(e,t){return arguments.length>1?this.each((t==null?Ru:typeof t=="function"?Lu:Hu)(e,t)):this.node()[e]}function Jr(e){return e.trim().split(/^|\s+/)}function So(e){return e.classList||new jr(e)}function jr(e){this._node=e,this._names=Jr(e.getAttribute("class")||"")}jr.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function ei(e,t){for(var n=So(e),o=-1,r=t.length;++o<r;)n.add(t[o])}function ti(e,t){for(var n=So(e),o=-1,r=t.length;++o<r;)n.remove(t[o])}function Bu(e){return function(){ei(this,e)}}function Vu(e){return function(){ti(this,e)}}function Fu(e,t){return function(){(t.apply(this,arguments)?ei:ti)(this,e)}}function ni(e,t){var n=Jr(e+"");if(arguments.length<2){for(var o=So(this.node()),r=-1,i=n.length;++r<i;)if(!o.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?Fu:t?Bu:Vu)(n,t))}function Xu(){this.textContent=""}function Yu(e){return function(){this.textContent=e}}function Zu(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function oi(e){return arguments.length?this.each(e==null?Xu:(typeof e=="function"?Zu:Yu)(e)):this.node().textContent}function Wu(){this.innerHTML=""}function qu(e){return function(){this.innerHTML=e}}function Gu(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function ri(e){return arguments.length?this.each(e==null?Wu:(typeof e=="function"?Gu:qu)(e)):this.node().innerHTML}function Ku(){this.nextSibling&&this.parentNode.appendChild(this)}function ii(){return this.each(Ku)}function Uu(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function si(){return this.each(Uu)}function ai(e){var t=typeof e=="function"?e:wn(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function Qu(){return null}function ci(e,t){var n=typeof e=="function"?e:wn(e),o=t==null?Qu:typeof t=="function"?t:et(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),o.apply(this,arguments)||null)})}function Ju(){var e=this.parentNode;e&&e.removeChild(this)}function li(){return this.each(Ju)}function ju(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function ed(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function ui(e){return this.select(e?ed:ju)}function di(e){return arguments.length?this.property("__data__",e):this.node().__data__}function td(e){return function(t){e.call(this,t,this.__data__)}}function nd(e){return e.trim().split(/^|\s+/).map(function(t){var n="",o=t.indexOf(".");return o>=0&&(n=t.slice(o+1),t=t.slice(0,o)),{type:t,name:n}})}function od(e){return function(){var t=this.__on;if(t){for(var n=0,o=-1,r=t.length,i;n<r;++n)i=t[n],(!e.type||i.type===e.type)&&i.name===e.name?this.removeEventListener(i.type,i.listener,i.options):t[++o]=i;++o?t.length=o:delete this.__on}}}function rd(e,t,n){return function(){var o=this.__on,r,i=td(t);if(o){for(var s=0,a=o.length;s<a;++s)if((r=o[s]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=i,r.options=n),r.value=t;return}}this.addEventListener(e.type,i,n),r={type:e.type,name:e.name,value:t,listener:i,options:n},o?o.push(r):this.__on=[r]}}function fi(e,t,n){var o=nd(e+""),r,i=o.length,s;if(arguments.length<2){var a=this.node().__on;if(a){for(var c=0,l=a.length,u;c<l;++c)for(r=0,u=a[c];r<i;++r)if((s=o[r]).type===u.type&&s.name===u.name)return u.value}return}for(a=t?rd:od,r=0;r<i;++r)this.each(a(o[r],t,n));return this}function hi(e,t,n){var o=En(e),r=o.CustomEvent;typeof r=="function"?r=new r(t,n):(r=o.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function id(e,t){return function(){return hi(this,e,t)}}function sd(e,t){return function(){return hi(this,e,t.apply(this,arguments))}}function pi(e,t){return this.each((typeof t=="function"?sd:id)(e,t))}function*gi(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var o=e[t],r=0,i=o.length,s;r<i;++r)(s=o[r])&&(yield s)}var _o=[null];function se(e,t){this._groups=e,this._parents=t}function mi(){return new se([[document.documentElement]],_o)}function ad(){return this}se.prototype=mi.prototype={constructor:se,select:Pr,selectAll:Ar,selectChild:Dr,selectChildren:Or,filter:Tr,data:Rr,enter:zr,exit:Hr,join:Lr,merge:Br,selection:ad,order:Vr,sort:Fr,call:Xr,nodes:Yr,node:Zr,size:Wr,empty:qr,each:Gr,attr:Kr,style:Ur,property:Qr,classed:ni,text:oi,html:ri,raise:ii,lower:si,append:ai,insert:ci,remove:li,clone:ui,datum:di,on:fi,dispatch:pi,[Symbol.iterator]:gi};var $e=mi;function ce(e){return typeof e=="string"?new se([[document.querySelector(e)]],[document.documentElement]):new se([[e]],_o)}function yi(e){let t;for(;t=e.sourceEvent;)e=t;return e}function fe(e,t){if(e=yi(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var o=n.createSVGPoint();return o.x=e.clientX,o.y=e.clientY,o=o.matrixTransform(t.getScreenCTM().inverse()),[o.x,o.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}var xi={passive:!1},tt={capture:!0,passive:!1};function Sn(e){e.stopImmediatePropagation()}function Fe(e){e.preventDefault(),e.stopImmediatePropagation()}function Ht(e){var t=e.document.documentElement,n=ce(e).on("dragstart.drag",Fe,tt);"onselectstart"in t?n.on("selectstart.drag",Fe,tt):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function Lt(e,t){var n=e.document.documentElement,o=ce(e).on("dragstart.drag",null);t&&(o.on("click.drag",Fe,tt),setTimeout(function(){o.on("click.drag",null)},0)),"onselectstart"in n?o.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var Bt=e=>()=>e;function Vt(e,{sourceEvent:t,subject:n,target:o,identifier:r,active:i,x:s,y:a,dx:c,dy:l,dispatch:u}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:o,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:i,enumerable:!0,configurable:!0},x:{value:s,enumerable:!0,configurable:!0},y:{value:a,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:l,enumerable:!0,configurable:!0},_:{value:u}})}Vt.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function cd(e){return!e.ctrlKey&&!e.button}function ld(){return this.parentNode}function ud(e,t){return t??{x:e.x,y:e.y}}function dd(){return navigator.maxTouchPoints||"ontouchstart"in this}function _n(){var e=cd,t=ld,n=ud,o=dd,r={},i=je("start","drag","end"),s=0,a,c,l,u,f=0;function d(w){w.on("mousedown.drag",h).filter(o).on("touchstart.drag",x).on("touchmove.drag",m,xi).on("touchend.drag touchcancel.drag",b).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function h(w,C){if(!(u||!e.call(this,w,C))){var E=g(this,t.call(this,w,C),w,C,"mouse");E&&(ce(w.view).on("mousemove.drag",p,tt).on("mouseup.drag",v,tt),Ht(w.view),Sn(w),l=!1,a=w.clientX,c=w.clientY,E("start",w))}}function p(w){if(Fe(w),!l){var C=w.clientX-a,E=w.clientY-c;l=C*C+E*E>f}r.mouse("drag",w)}function v(w){ce(w.view).on("mousemove.drag mouseup.drag",null),Lt(w.view,l),Fe(w),r.mouse("end",w)}function x(w,C){if(e.call(this,w,C)){var E=w.changedTouches,M=t.call(this,w,C),A=E.length,P,V;for(P=0;P<A;++P)(V=g(this,M,w,C,E[P].identifier,E[P]))&&(Sn(w),V("start",w,E[P]))}}function m(w){var C=w.changedTouches,E=C.length,M,A;for(M=0;M<E;++M)(A=r[C[M].identifier])&&(Fe(w),A("drag",w,C[M]))}function b(w){var C=w.changedTouches,E=C.length,M,A;for(u&&clearTimeout(u),u=setTimeout(function(){u=null},500),M=0;M<E;++M)(A=r[C[M].identifier])&&(Sn(w),A("end",w,C[M]))}function g(w,C,E,M,A,P){var V=i.copy(),T=fe(P||E,C),H,$,y;if((y=n.call(w,new Vt("beforestart",{sourceEvent:E,target:d,identifier:A,active:s,x:T[0],y:T[1],dx:0,dy:0,dispatch:V}),M))!=null)return H=y.x-T[0]||0,$=y.y-T[1]||0,function S(N,I,D){var O=T,R;switch(N){case"start":r[A]=S,R=s++;break;case"end":delete r[A],--s;case"drag":T=fe(D||I,C),R=s;break}V.call(N,w,new Vt(N,{sourceEvent:I,subject:y,target:d,identifier:A,active:R,x:T[0]+H,y:T[1]+$,dx:T[0]-O[0],dy:T[1]-O[1],dispatch:V}),M)}}return d.filter=function(w){return arguments.length?(e=typeof w=="function"?w:Bt(!!w),d):e},d.container=function(w){return arguments.length?(t=typeof w=="function"?w:Bt(w),d):t},d.subject=function(w){return arguments.length?(n=typeof w=="function"?w:Bt(w),d):n},d.touchable=function(w){return arguments.length?(o=typeof w=="function"?w:Bt(!!w),d):o},d.on=function(){var w=i.on.apply(i,arguments);return w===i?d:w},d.clickDistance=function(w){return arguments.length?(f=(w=+w)*w,d):Math.sqrt(f)},d}function Cn(e,t,n){e.prototype=t.prototype=n,n.constructor=e}function Co(e,t){var n=Object.create(e.prototype);for(var o in t)n[o]=t[o];return n}function Yt(){}var Ft=.7,In=1/Ft,mt="\\s*([+-]?\\d+)\\s*",Xt="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",Ie="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",fd=/^#([0-9a-f]{3,8})$/,hd=new RegExp(`^rgb\\(${mt},${mt},${mt}\\)$`),pd=new RegExp(`^rgb\\(${Ie},${Ie},${Ie}\\)$`),gd=new RegExp(`^rgba\\(${mt},${mt},${mt},${Xt}\\)$`),md=new RegExp(`^rgba\\(${Ie},${Ie},${Ie},${Xt}\\)$`),yd=new RegExp(`^hsl\\(${Xt},${Ie},${Ie}\\)$`),xd=new RegExp(`^hsla\\(${Xt},${Ie},${Ie},${Xt}\\)$`),wi={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Cn(Yt,Se,{copy(e){return Object.assign(new this.constructor,this,e)},displayable(){return this.rgb().displayable()},hex:vi,formatHex:vi,formatHex8:wd,formatHsl:vd,formatRgb:bi,toString:bi});function vi(){return this.rgb().formatHex()}function wd(){return this.rgb().formatHex8()}function vd(){return Mi(this).formatHsl()}function bi(){return this.rgb().formatRgb()}function Se(e){var t,n;return e=(e+"").trim().toLowerCase(),(t=fd.exec(e))?(n=t[1].length,t=parseInt(t[1],16),n===6?Ei(t):n===3?new ye(t>>8&15|t>>4&240,t>>4&15|t&240,(t&15)<<4|t&15,1):n===8?Nn(t>>24&255,t>>16&255,t>>8&255,(t&255)/255):n===4?Nn(t>>12&15|t>>8&240,t>>8&15|t>>4&240,t>>4&15|t&240,((t&15)<<4|t&15)/255):null):(t=hd.exec(e))?new ye(t[1],t[2],t[3],1):(t=pd.exec(e))?new ye(t[1]*255/100,t[2]*255/100,t[3]*255/100,1):(t=gd.exec(e))?Nn(t[1],t[2],t[3],t[4]):(t=md.exec(e))?Nn(t[1]*255/100,t[2]*255/100,t[3]*255/100,t[4]):(t=yd.exec(e))?Ci(t[1],t[2]/100,t[3]/100,1):(t=xd.exec(e))?Ci(t[1],t[2]/100,t[3]/100,t[4]):wi.hasOwnProperty(e)?Ei(wi[e]):e==="transparent"?new ye(NaN,NaN,NaN,0):null}function Ei(e){return new ye(e>>16&255,e>>8&255,e&255,1)}function Nn(e,t,n,o){return o<=0&&(e=t=n=NaN),new ye(e,t,n,o)}function bd(e){return e instanceof Yt||(e=Se(e)),e?(e=e.rgb(),new ye(e.r,e.g,e.b,e.opacity)):new ye}function yt(e,t,n,o){return arguments.length===1?bd(e):new ye(e,t,n,o??1)}function ye(e,t,n,o){this.r=+e,this.g=+t,this.b=+n,this.opacity=+o}Cn(ye,yt,Co(Yt,{brighter(e){return e=e==null?In:Math.pow(In,e),new ye(this.r*e,this.g*e,this.b*e,this.opacity)},darker(e){return e=e==null?Ft:Math.pow(Ft,e),new ye(this.r*e,this.g*e,this.b*e,this.opacity)},rgb(){return this},clamp(){return new ye(ot(this.r),ot(this.g),ot(this.b),kn(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:Si,formatHex:Si,formatHex8:Ed,formatRgb:_i,toString:_i}));function Si(){return`#${nt(this.r)}${nt(this.g)}${nt(this.b)}`}function Ed(){return`#${nt(this.r)}${nt(this.g)}${nt(this.b)}${nt((isNaN(this.opacity)?1:this.opacity)*255)}`}function _i(){let e=kn(this.opacity);return`${e===1?"rgb(":"rgba("}${ot(this.r)}, ${ot(this.g)}, ${ot(this.b)}${e===1?")":`, ${e})`}`}function kn(e){return isNaN(e)?1:Math.max(0,Math.min(1,e))}function ot(e){return Math.max(0,Math.min(255,Math.round(e)||0))}function nt(e){return e=ot(e),(e<16?"0":"")+e.toString(16)}function Ci(e,t,n,o){return o<=0?e=t=n=NaN:n<=0||n>=1?e=t=NaN:t<=0&&(e=NaN),new Ee(e,t,n,o)}function Mi(e){if(e instanceof Ee)return new Ee(e.h,e.s,e.l,e.opacity);if(e instanceof Yt||(e=Se(e)),!e)return new Ee;if(e instanceof Ee)return e;e=e.rgb();var t=e.r/255,n=e.g/255,o=e.b/255,r=Math.min(t,n,o),i=Math.max(t,n,o),s=NaN,a=i-r,c=(i+r)/2;return a?(t===i?s=(n-o)/a+(n<o)*6:n===i?s=(o-t)/a+2:s=(t-n)/a+4,a/=c<.5?i+r:2-i-r,s*=60):a=c>0&&c<1?0:s,new Ee(s,a,c,e.opacity)}function Ii(e,t,n,o){return arguments.length===1?Mi(e):new Ee(e,t,n,o??1)}function Ee(e,t,n,o){this.h=+e,this.s=+t,this.l=+n,this.opacity=+o}Cn(Ee,Ii,Co(Yt,{brighter(e){return e=e==null?In:Math.pow(In,e),new Ee(this.h,this.s,this.l*e,this.opacity)},darker(e){return e=e==null?Ft:Math.pow(Ft,e),new Ee(this.h,this.s,this.l*e,this.opacity)},rgb(){var e=this.h%360+(this.h<0)*360,t=isNaN(e)||isNaN(this.s)?0:this.s,n=this.l,o=n+(n<.5?n:1-n)*t,r=2*n-o;return new ye(No(e>=240?e-240:e+120,r,o),No(e,r,o),No(e<120?e+240:e-120,r,o),this.opacity)},clamp(){return new Ee(Ni(this.h),Mn(this.s),Mn(this.l),kn(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){let e=kn(this.opacity);return`${e===1?"hsl(":"hsla("}${Ni(this.h)}, ${Mn(this.s)*100}%, ${Mn(this.l)*100}%${e===1?")":`, ${e})`}`}}));function Ni(e){return e=(e||0)%360,e<0?e+360:e}function Mn(e){return Math.max(0,Math.min(1,e||0))}function No(e,t,n){return(e<60?t+(n-t)*e/60:e<180?n:e<240?t+(n-t)*(240-e)/60:t)*255}function Mo(e,t,n,o,r){var i=e*e,s=i*e;return((1-3*e+3*i-s)*t+(4-6*i+3*s)*n+(1+3*e+3*i-3*s)*o+s*r)/6}function ki(e){var t=e.length-1;return function(n){var o=n<=0?n=0:n>=1?(n=1,t-1):Math.floor(n*t),r=e[o],i=e[o+1],s=o>0?e[o-1]:2*r-i,a=o<t-1?e[o+2]:2*i-r;return Mo((n-o/t)*t,s,r,i,a)}}function Pi(e){var t=e.length;return function(n){var o=Math.floor(((n%=1)<0?++n:n)*t),r=e[(o+t-1)%t],i=e[o%t],s=e[(o+1)%t],a=e[(o+2)%t];return Mo((n-o/t)*t,r,i,s,a)}}var Zt=e=>()=>e;function Sd(e,t){return function(n){return e+n*t}}function _d(e,t,n){return e=Math.pow(e,n),t=Math.pow(t,n)-e,n=1/n,function(o){return Math.pow(e+o*t,n)}}function Ai(e){return(e=+e)==1?Pn:function(t,n){return n-t?_d(t,n,e):Zt(isNaN(t)?n:t)}}function Pn(e,t){var n=t-e;return n?Sd(e,n):Zt(isNaN(e)?t:e)}var rt=(function e(t){var n=Ai(t);function o(r,i){var s=n((r=yt(r)).r,(i=yt(i)).r),a=n(r.g,i.g),c=n(r.b,i.b),l=Pn(r.opacity,i.opacity);return function(u){return r.r=s(u),r.g=a(u),r.b=c(u),r.opacity=l(u),r+""}}return o.gamma=e,o})(1);function Di(e){return function(t){var n=t.length,o=new Array(n),r=new Array(n),i=new Array(n),s,a;for(s=0;s<n;++s)a=yt(t[s]),o[s]=a.r||0,r[s]=a.g||0,i[s]=a.b||0;return o=e(o),r=e(r),i=e(i),a.opacity=1,function(c){return a.r=o(c),a.g=r(c),a.b=i(c),a+""}}}var Cd=Di(ki),Nd=Di(Pi);function Oi(e,t){t||(t=[]);var n=e?Math.min(t.length,e.length):0,o=t.slice(),r;return function(i){for(r=0;r<n;++r)o[r]=e[r]*(1-i)+t[r]*i;return o}}function Ti(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function zi(e,t){var n=t?t.length:0,o=e?Math.min(n,e.length):0,r=new Array(o),i=new Array(n),s;for(s=0;s<o;++s)r[s]=Re(e[s],t[s]);for(;s<n;++s)i[s]=t[s];return function(a){for(s=0;s<o;++s)i[s]=r[s](a);return i}}function $i(e,t){var n=new Date;return e=+e,t=+t,function(o){return n.setTime(e*(1-o)+t*o),n}}function he(e,t){return e=+e,t=+t,function(n){return e*(1-n)+t*n}}function Ri(e,t){var n={},o={},r;(e===null||typeof e!="object")&&(e={}),(t===null||typeof t!="object")&&(t={});for(r in t)r in e?n[r]=Re(e[r],t[r]):o[r]=t[r];return function(i){for(r in n)o[r]=n[r](i);return o}}var ko=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,Io=new RegExp(ko.source,"g");function Md(e){return function(){return e}}function Id(e){return function(t){return e(t)+""}}function Wt(e,t){var n=ko.lastIndex=Io.lastIndex=0,o,r,i,s=-1,a=[],c=[];for(e=e+"",t=t+"";(o=ko.exec(e))&&(r=Io.exec(t));)(i=r.index)>n&&(i=t.slice(n,i),a[s]?a[s]+=i:a[++s]=i),(o=o[0])===(r=r[0])?a[s]?a[s]+=r:a[++s]=r:(a[++s]=null,c.push({i:s,x:he(o,r)})),n=Io.lastIndex;return n<t.length&&(i=t.slice(n),a[s]?a[s]+=i:a[++s]=i),a.length<2?c[0]?Id(c[0].x):Md(t):(t=c.length,function(l){for(var u=0,f;u<t;++u)a[(f=c[u]).i]=f.x(l);return a.join("")})}function Re(e,t){var n=typeof t,o;return t==null||n==="boolean"?Zt(t):(n==="number"?he:n==="string"?(o=Se(t))?(t=o,rt):Wt:t instanceof Se?rt:t instanceof Date?$i:Ti(t)?Oi:Array.isArray(t)?zi:typeof t.valueOf!="function"&&typeof t.toString!="function"||isNaN(t)?Ri:he)(e,t)}var Hi=180/Math.PI,An={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Po(e,t,n,o,r,i){var s,a,c;return(s=Math.sqrt(e*e+t*t))&&(e/=s,t/=s),(c=e*n+t*o)&&(n-=e*c,o-=t*c),(a=Math.sqrt(n*n+o*o))&&(n/=a,o/=a,c/=a),e*o<t*n&&(e=-e,t=-t,c=-c,s=-s),{translateX:r,translateY:i,rotate:Math.atan2(t,e)*Hi,skewX:Math.atan(c)*Hi,scaleX:s,scaleY:a}}var Dn;function Li(e){let t=new(typeof DOMMatrix=="function"?DOMMatrix:WebKitCSSMatrix)(e+"");return t.isIdentity?An:Po(t.a,t.b,t.c,t.d,t.e,t.f)}function Bi(e){return e==null?An:(Dn||(Dn=document.createElementNS("http://www.w3.org/2000/svg","g")),Dn.setAttribute("transform",e),(e=Dn.transform.baseVal.consolidate())?(e=e.matrix,Po(e.a,e.b,e.c,e.d,e.e,e.f)):An)}function Vi(e,t,n,o){function r(l){return l.length?l.pop()+" ":""}function i(l,u,f,d,h,p){if(l!==f||u!==d){var v=h.push("translate(",null,t,null,n);p.push({i:v-4,x:he(l,f)},{i:v-2,x:he(u,d)})}else(f||d)&&h.push("translate("+f+t+d+n)}function s(l,u,f,d){l!==u?(l-u>180?u+=360:u-l>180&&(l+=360),d.push({i:f.push(r(f)+"rotate(",null,o)-2,x:he(l,u)})):u&&f.push(r(f)+"rotate("+u+o)}function a(l,u,f,d){l!==u?d.push({i:f.push(r(f)+"skewX(",null,o)-2,x:he(l,u)}):u&&f.push(r(f)+"skewX("+u+o)}function c(l,u,f,d,h,p){if(l!==f||u!==d){var v=h.push(r(h)+"scale(",null,",",null,")");p.push({i:v-4,x:he(l,f)},{i:v-2,x:he(u,d)})}else(f!==1||d!==1)&&h.push(r(h)+"scale("+f+","+d+")")}return function(l,u){var f=[],d=[];return l=e(l),u=e(u),i(l.translateX,l.translateY,u.translateX,u.translateY,f,d),s(l.rotate,u.rotate,f,d),a(l.skewX,u.skewX,f,d),c(l.scaleX,l.scaleY,u.scaleX,u.scaleY,f,d),l=u=null,function(h){for(var p=-1,v=d.length,x;++p<v;)f[(x=d[p]).i]=x.x(h);return f.join("")}}}var Ao=Vi(Li,"px, ","px)","deg)"),Do=Vi(Bi,", ",")",")");var kd=1e-12;function Fi(e){return((e=Math.exp(e))+1/e)/2}function Pd(e){return((e=Math.exp(e))-1/e)/2}function Ad(e){return((e=Math.exp(2*e))-1)/(e+1)}var it=(function e(t,n,o){function r(i,s){var a=i[0],c=i[1],l=i[2],u=s[0],f=s[1],d=s[2],h=u-a,p=f-c,v=h*h+p*p,x,m;if(v<kd)m=Math.log(d/l)/t,x=function(M){return[a+M*h,c+M*p,l*Math.exp(t*M*m)]};else{var b=Math.sqrt(v),g=(d*d-l*l+o*v)/(2*l*n*b),w=(d*d-l*l-o*v)/(2*d*n*b),C=Math.log(Math.sqrt(g*g+1)-g),E=Math.log(Math.sqrt(w*w+1)-w);m=(E-C)/t,x=function(M){var A=M*m,P=Fi(C),V=l/(n*b)*(P*Ad(t*A+C)-Pd(C));return[a+V*h,c+V*p,l*P/Fi(t*A+C)]}}return x.duration=m*1e3*t/Math.SQRT2,x}return r.rho=function(i){var s=Math.max(.001,+i),a=s*s,c=a*a;return e(s,a,c)},r})(Math.SQRT2,2,4);var xt=0,Gt=0,qt=0,Yi=1e3,On,Kt,Tn=0,st=0,zn=0,Ut=typeof performance=="object"&&performance.now?performance:Date,Zi=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Jt(){return st||(Zi(Dd),st=Ut.now()+zn)}function Dd(){st=0}function Qt(){this._call=this._time=this._next=null}Qt.prototype=$n.prototype={constructor:Qt,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?Jt():+n)+(t==null?0:+t),!this._next&&Kt!==this&&(Kt?Kt._next=this:On=this,Kt=this),this._call=e,this._time=n,Oo()},stop:function(){this._call&&(this._call=null,this._time=1/0,Oo())}};function $n(e,t,n){var o=new Qt;return o.restart(e,t,n),o}function Wi(){Jt(),++xt;for(var e=On,t;e;)(t=st-e._time)>=0&&e._call.call(void 0,t),e=e._next;--xt}function Xi(){st=(Tn=Ut.now())+zn,xt=Gt=0;try{Wi()}finally{xt=0,Td(),st=0}}function Od(){var e=Ut.now(),t=e-Tn;t>Yi&&(zn-=t,Tn=e)}function Td(){for(var e,t=On,n,o=1/0;t;)t._call?(o>t._time&&(o=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:On=n);Kt=e,Oo(o)}function Oo(e){if(!xt){Gt&&(Gt=clearTimeout(Gt));var t=e-st;t>24?(e<1/0&&(Gt=setTimeout(Xi,e-Ut.now()-zn)),qt&&(qt=clearInterval(qt))):(qt||(Tn=Ut.now(),qt=setInterval(Od,Yi)),xt=1,Zi(Xi))}}function Rn(e,t,n){var o=new Qt;return t=t==null?0:+t,o.restart(r=>{o.stop(),e(r+t)},t,n),o}var zd=je("start","end","cancel","interrupt"),$d=[],Ki=0,qi=1,Ln=2,Hn=3,Gi=4,Bn=5,jt=6;function Xe(e,t,n,o,r,i){var s=e.__transition;if(!s)e.__transition={};else if(n in s)return;Rd(e,n,{name:t,index:o,group:r,on:zd,tween:$d,time:i.time,delay:i.delay,duration:i.duration,ease:i.ease,timer:null,state:Ki})}function en(e,t){var n=ae(e,t);if(n.state>Ki)throw new Error("too late; already scheduled");return n}function ue(e,t){var n=ae(e,t);if(n.state>Hn)throw new Error("too late; already running");return n}function ae(e,t){var n=e.__transition;if(!n||!(n=n[t]))throw new Error("transition not found");return n}function Rd(e,t,n){var o=e.__transition,r;o[t]=n,n.timer=$n(i,0,n.time);function i(l){n.state=qi,n.timer.restart(s,n.delay,n.time),n.delay<=l&&s(l-n.delay)}function s(l){var u,f,d,h;if(n.state!==qi)return c();for(u in o)if(h=o[u],h.name===n.name){if(h.state===Hn)return Rn(s);h.state===Gi?(h.state=jt,h.timer.stop(),h.on.call("interrupt",e,e.__data__,h.index,h.group),delete o[u]):+u<t&&(h.state=jt,h.timer.stop(),h.on.call("cancel",e,e.__data__,h.index,h.group),delete o[u])}if(Rn(function(){n.state===Hn&&(n.state=Gi,n.timer.restart(a,n.delay,n.time),a(l))}),n.state=Ln,n.on.call("start",e,e.__data__,n.index,n.group),n.state===Ln){for(n.state=Hn,r=new Array(d=n.tween.length),u=0,f=-1;u<d;++u)(h=n.tween[u].value.call(e,e.__data__,n.index,n.group))&&(r[++f]=h);r.length=f+1}}function a(l){for(var u=l<n.duration?n.ease.call(null,l/n.duration):(n.timer.restart(c),n.state=Bn,1),f=-1,d=r.length;++f<d;)r[f].call(e,u);n.state===Bn&&(n.on.call("end",e,e.__data__,n.index,n.group),c())}function c(){n.state=jt,n.timer.stop(),delete o[t];for(var l in o)return;delete e.__transition}}function at(e,t){var n=e.__transition,o,r,i=!0,s;if(n){t=t==null?null:t+"";for(s in n){if((o=n[s]).name!==t){i=!1;continue}r=o.state>Ln&&o.state<Bn,o.state=jt,o.timer.stop(),o.on.call(r?"interrupt":"cancel",e,e.__data__,o.index,o.group),delete n[s]}i&&delete e.__transition}}function Ui(e){return this.each(function(){at(this,e)})}function Hd(e,t){var n,o;return function(){var r=ue(this,e),i=r.tween;if(i!==n){o=n=i;for(var s=0,a=o.length;s<a;++s)if(o[s].name===t){o=o.slice(),o.splice(s,1);break}}r.tween=o}}function Ld(e,t,n){var o,r;if(typeof n!="function")throw new Error;return function(){var i=ue(this,e),s=i.tween;if(s!==o){r=(o=s).slice();for(var a={name:t,value:n},c=0,l=r.length;c<l;++c)if(r[c].name===t){r[c]=a;break}c===l&&r.push(a)}i.tween=r}}function Qi(e,t){var n=this._id;if(e+="",arguments.length<2){for(var o=ae(this.node(),n).tween,r=0,i=o.length,s;r<i;++r)if((s=o[r]).name===e)return s.value;return null}return this.each((t==null?Hd:Ld)(n,e,t))}function wt(e,t,n){var o=e._id;return e.each(function(){var r=ue(this,o);(r.value||(r.value={}))[t]=n.apply(this,arguments)}),function(r){return ae(r,o).value[t]}}function Vn(e,t){var n;return(typeof t=="number"?he:t instanceof Se?rt:(n=Se(t))?(t=n,rt):Wt)(e,t)}function Bd(e){return function(){this.removeAttribute(e)}}function Vd(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Fd(e,t,n){var o,r=n+"",i;return function(){var s=this.getAttribute(e);return s===r?null:s===o?i:i=t(o=s,n)}}function Xd(e,t,n){var o,r=n+"",i;return function(){var s=this.getAttributeNS(e.space,e.local);return s===r?null:s===o?i:i=t(o=s,n)}}function Yd(e,t,n){var o,r,i;return function(){var s,a=n(this),c;return a==null?void this.removeAttribute(e):(s=this.getAttribute(e),c=a+"",s===c?null:s===o&&c===r?i:(r=c,i=t(o=s,a)))}}function Zd(e,t,n){var o,r,i;return function(){var s,a=n(this),c;return a==null?void this.removeAttributeNS(e.space,e.local):(s=this.getAttributeNS(e.space,e.local),c=a+"",s===c?null:s===o&&c===r?i:(r=c,i=t(o=s,a)))}}function Ji(e,t){var n=ze(e),o=n==="transform"?Do:Vn;return this.attrTween(e,typeof t=="function"?(n.local?Zd:Yd)(n,o,wt(this,"attr."+e,t)):t==null?(n.local?Vd:Bd)(n):(n.local?Xd:Fd)(n,o,t))}function Wd(e,t){return function(n){this.setAttribute(e,t.call(this,n))}}function qd(e,t){return function(n){this.setAttributeNS(e.space,e.local,t.call(this,n))}}function Gd(e,t){var n,o;function r(){var i=t.apply(this,arguments);return i!==o&&(n=(o=i)&&qd(e,i)),n}return r._value=t,r}function Kd(e,t){var n,o;function r(){var i=t.apply(this,arguments);return i!==o&&(n=(o=i)&&Wd(e,i)),n}return r._value=t,r}function ji(e,t){var n="attr."+e;if(arguments.length<2)return(n=this.tween(n))&&n._value;if(t==null)return this.tween(n,null);if(typeof t!="function")throw new Error;var o=ze(e);return this.tween(n,(o.local?Gd:Kd)(o,t))}function Ud(e,t){return function(){en(this,e).delay=+t.apply(this,arguments)}}function Qd(e,t){return t=+t,function(){en(this,e).delay=t}}function es(e){var t=this._id;return arguments.length?this.each((typeof e=="function"?Ud:Qd)(t,e)):ae(this.node(),t).delay}function Jd(e,t){return function(){ue(this,e).duration=+t.apply(this,arguments)}}function jd(e,t){return t=+t,function(){ue(this,e).duration=t}}function ts(e){var t=this._id;return arguments.length?this.each((typeof e=="function"?Jd:jd)(t,e)):ae(this.node(),t).duration}function ef(e,t){if(typeof t!="function")throw new Error;return function(){ue(this,e).ease=t}}function ns(e){var t=this._id;return arguments.length?this.each(ef(t,e)):ae(this.node(),t).ease}function tf(e,t){return function(){var n=t.apply(this,arguments);if(typeof n!="function")throw new Error;ue(this,e).ease=n}}function os(e){if(typeof e!="function")throw new Error;return this.each(tf(this._id,e))}function rs(e){typeof e!="function"&&(e=$t(e));for(var t=this._groups,n=t.length,o=new Array(n),r=0;r<n;++r)for(var i=t[r],s=i.length,a=o[r]=[],c,l=0;l<s;++l)(c=i[l])&&e.call(c,c.__data__,l,i)&&a.push(c);return new pe(o,this._parents,this._name,this._id)}function is(e){if(e._id!==this._id)throw new Error;for(var t=this._groups,n=e._groups,o=t.length,r=n.length,i=Math.min(o,r),s=new Array(o),a=0;a<i;++a)for(var c=t[a],l=n[a],u=c.length,f=s[a]=new Array(u),d,h=0;h<u;++h)(d=c[h]||l[h])&&(f[h]=d);for(;a<o;++a)s[a]=t[a];return new pe(s,this._parents,this._name,this._id)}function nf(e){return(e+"").trim().split(/^|\s+/).every(function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||t==="start"})}function of(e,t,n){var o,r,i=nf(t)?en:ue;return function(){var s=i(this,e),a=s.on;a!==o&&(r=(o=a).copy()).on(t,n),s.on=r}}function ss(e,t){var n=this._id;return arguments.length<2?ae(this.node(),n).on.on(e):this.each(of(n,e,t))}function rf(e){return function(){var t=this.parentNode;for(var n in this.__transition)if(+n!==e)return;t&&t.removeChild(this)}}function as(){return this.on("end.remove",rf(this._id))}function cs(e){var t=this._name,n=this._id;typeof e!="function"&&(e=et(e));for(var o=this._groups,r=o.length,i=new Array(r),s=0;s<r;++s)for(var a=o[s],c=a.length,l=i[s]=new Array(c),u,f,d=0;d<c;++d)(u=a[d])&&(f=e.call(u,u.__data__,d,a))&&("__data__"in u&&(f.__data__=u.__data__),l[d]=f,Xe(l[d],t,n,d,l,ae(u,n)));return new pe(i,this._parents,t,n)}function ls(e){var t=this._name,n=this._id;typeof e!="function"&&(e=zt(e));for(var o=this._groups,r=o.length,i=[],s=[],a=0;a<r;++a)for(var c=o[a],l=c.length,u,f=0;f<l;++f)if(u=c[f]){for(var d=e.call(u,u.__data__,f,c),h,p=ae(u,n),v=0,x=d.length;v<x;++v)(h=d[v])&&Xe(h,t,n,v,d,p);i.push(d),s.push(u)}return new pe(i,s,t,n)}var sf=$e.prototype.constructor;function us(){return new sf(this._groups,this._parents)}function af(e,t){var n,o,r;return function(){var i=Ve(this,e),s=(this.style.removeProperty(e),Ve(this,e));return i===s?null:i===n&&s===o?r:r=t(n=i,o=s)}}function ds(e){return function(){this.style.removeProperty(e)}}function cf(e,t,n){var o,r=n+"",i;return function(){var s=Ve(this,e);return s===r?null:s===o?i:i=t(o=s,n)}}function lf(e,t,n){var o,r,i;return function(){var s=Ve(this,e),a=n(this),c=a+"";return a==null&&(c=a=(this.style.removeProperty(e),Ve(this,e))),s===c?null:s===o&&c===r?i:(r=c,i=t(o=s,a))}}function uf(e,t){var n,o,r,i="style."+t,s="end."+i,a;return function(){var c=ue(this,e),l=c.on,u=c.value[i]==null?a||(a=ds(t)):void 0;(l!==n||r!==u)&&(o=(n=l).copy()).on(s,r=u),c.on=o}}function fs(e,t,n){var o=(e+="")=="transform"?Ao:Vn;return t==null?this.styleTween(e,af(e,o)).on("end.style."+e,ds(e)):typeof t=="function"?this.styleTween(e,lf(e,o,wt(this,"style."+e,t))).each(uf(this._id,e)):this.styleTween(e,cf(e,o,t),n).on("end.style."+e,null)}function df(e,t,n){return function(o){this.style.setProperty(e,t.call(this,o),n)}}function ff(e,t,n){var o,r;function i(){var s=t.apply(this,arguments);return s!==r&&(o=(r=s)&&df(e,s,n)),o}return i._value=t,i}function hs(e,t,n){var o="style."+(e+="");if(arguments.length<2)return(o=this.tween(o))&&o._value;if(t==null)return this.tween(o,null);if(typeof t!="function")throw new Error;return this.tween(o,ff(e,t,n??""))}function hf(e){return function(){this.textContent=e}}function pf(e){return function(){var t=e(this);this.textContent=t??""}}function ps(e){return this.tween("text",typeof e=="function"?pf(wt(this,"text",e)):hf(e==null?"":e+""))}function gf(e){return function(t){this.textContent=e.call(this,t)}}function mf(e){var t,n;function o(){var r=e.apply(this,arguments);return r!==n&&(t=(n=r)&&gf(r)),t}return o._value=e,o}function gs(e){var t="text";if(arguments.length<1)return(t=this.tween(t))&&t._value;if(e==null)return this.tween(t,null);if(typeof e!="function")throw new Error;return this.tween(t,mf(e))}function ms(){for(var e=this._name,t=this._id,n=Fn(),o=this._groups,r=o.length,i=0;i<r;++i)for(var s=o[i],a=s.length,c,l=0;l<a;++l)if(c=s[l]){var u=ae(c,t);Xe(c,e,n,l,s,{time:u.time+u.delay+u.duration,delay:0,duration:u.duration,ease:u.ease})}return new pe(o,this._parents,e,n)}function ys(){var e,t,n=this,o=n._id,r=n.size();return new Promise(function(i,s){var a={value:s},c={value:function(){--r===0&&i()}};n.each(function(){var l=ue(this,o),u=l.on;u!==e&&(t=(e=u).copy(),t._.cancel.push(a),t._.interrupt.push(a),t._.end.push(c)),l.on=t}),r===0&&i()})}var yf=0;function pe(e,t,n,o){this._groups=e,this._parents=t,this._name=n,this._id=o}function xs(e){return $e().transition(e)}function Fn(){return++yf}var He=$e.prototype;pe.prototype=xs.prototype={constructor:pe,select:cs,selectAll:ls,selectChild:He.selectChild,selectChildren:He.selectChildren,filter:rs,merge:is,selection:us,transition:ms,call:He.call,nodes:He.nodes,node:He.node,size:He.size,empty:He.empty,each:He.each,on:ss,attr:Ji,attrTween:ji,style:fs,styleTween:hs,text:ps,textTween:gs,remove:as,tween:Qi,delay:es,duration:ts,ease:ns,easeVarying:os,end:ys,[Symbol.iterator]:He[Symbol.iterator]};function Xn(e){return((e*=2)<=1?e*e*e:(e-=2)*e*e+2)/2}var xf={time:null,delay:0,duration:250,ease:Xn};function wf(e,t){for(var n;!(n=e.__transition)||!(n=n[t]);)if(!(e=e.parentNode))throw new Error(`transition ${t} not found`);return n}function ws(e){var t,n;e instanceof pe?(t=e._id,e=e._name):(t=Fn(),(n=xf).time=Jt(),e=e==null?null:e+"");for(var o=this._groups,r=o.length,i=0;i<r;++i)for(var s=o[i],a=s.length,c,l=0;l<a;++l)(c=s[l])&&Xe(c,e,t,l,s,n||wf(c,t));return new pe(o,this._parents,e,t)}$e.prototype.interrupt=Ui;$e.prototype.transition=ws;var tn=e=>()=>e;function To(e,{sourceEvent:t,target:n,transform:o,dispatch:r}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},target:{value:n,enumerable:!0,configurable:!0},transform:{value:o,enumerable:!0,configurable:!0},_:{value:r}})}function _e(e,t,n){this.k=e,this.x=t,this.y=n}_e.prototype={constructor:_e,scale:function(e){return e===1?this:new _e(this.k*e,this.x,this.y)},translate:function(e,t){return e===0&t===0?this:new _e(this.k,this.x+this.k*e,this.y+this.k*t)},apply:function(e){return[e[0]*this.k+this.x,e[1]*this.k+this.y]},applyX:function(e){return e*this.k+this.x},applyY:function(e){return e*this.k+this.y},invert:function(e){return[(e[0]-this.x)/this.k,(e[1]-this.y)/this.k]},invertX:function(e){return(e-this.x)/this.k},invertY:function(e){return(e-this.y)/this.k},rescaleX:function(e){return e.copy().domain(e.range().map(this.invertX,this).map(e.invert,e))},rescaleY:function(e){return e.copy().domain(e.range().map(this.invertY,this).map(e.invert,e))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var ct=new _e(1,0,0);nn.prototype=_e.prototype;function nn(e){for(;!e.__zoom;)if(!(e=e.parentNode))return ct;return e.__zoom}function Yn(e){e.stopImmediatePropagation()}function vt(e){e.preventDefault(),e.stopImmediatePropagation()}function vf(e){return(!e.ctrlKey||e.type==="wheel")&&!e.button}function bf(){var e=this;return e instanceof SVGElement?(e=e.ownerSVGElement||e,e.hasAttribute("viewBox")?(e=e.viewBox.baseVal,[[e.x,e.y],[e.x+e.width,e.y+e.height]]):[[0,0],[e.width.baseVal.value,e.height.baseVal.value]]):[[0,0],[e.clientWidth,e.clientHeight]]}function vs(){return this.__zoom||ct}function Ef(e){return-e.deltaY*(e.deltaMode===1?.05:e.deltaMode?1:.002)*(e.ctrlKey?10:1)}function Sf(){return navigator.maxTouchPoints||"ontouchstart"in this}function _f(e,t,n){var o=e.invertX(t[0][0])-n[0][0],r=e.invertX(t[1][0])-n[1][0],i=e.invertY(t[0][1])-n[0][1],s=e.invertY(t[1][1])-n[1][1];return e.translate(r>o?(o+r)/2:Math.min(0,o)||Math.max(0,r),s>i?(i+s)/2:Math.min(0,i)||Math.max(0,s))}function Zn(){var e=vf,t=bf,n=_f,o=Ef,r=Sf,i=[0,1/0],s=[[-1/0,-1/0],[1/0,1/0]],a=250,c=it,l=je("start","zoom","end"),u,f,d,h=500,p=150,v=0,x=10;function m(y){y.property("__zoom",vs).on("wheel.zoom",A,{passive:!1}).on("mousedown.zoom",P).on("dblclick.zoom",V).filter(r).on("touchstart.zoom",T).on("touchmove.zoom",H).on("touchend.zoom touchcancel.zoom",$).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}m.transform=function(y,S,N,I){var D=y.selection?y.selection():y;D.property("__zoom",vs),y!==D?C(y,S,N,I):D.interrupt().each(function(){E(this,arguments).event(I).start().zoom(null,typeof S=="function"?S.apply(this,arguments):S).end()})},m.scaleBy=function(y,S,N,I){m.scaleTo(y,function(){var D=this.__zoom.k,O=typeof S=="function"?S.apply(this,arguments):S;return D*O},N,I)},m.scaleTo=function(y,S,N,I){m.transform(y,function(){var D=t.apply(this,arguments),O=this.__zoom,R=N==null?w(D):typeof N=="function"?N.apply(this,arguments):N,B=O.invert(R),L=typeof S=="function"?S.apply(this,arguments):S;return n(g(b(O,L),R,B),D,s)},N,I)},m.translateBy=function(y,S,N,I){m.transform(y,function(){return n(this.__zoom.translate(typeof S=="function"?S.apply(this,arguments):S,typeof N=="function"?N.apply(this,arguments):N),t.apply(this,arguments),s)},null,I)},m.translateTo=function(y,S,N,I,D){m.transform(y,function(){var O=t.apply(this,arguments),R=this.__zoom,B=I==null?w(O):typeof I=="function"?I.apply(this,arguments):I;return n(ct.translate(B[0],B[1]).scale(R.k).translate(typeof S=="function"?-S.apply(this,arguments):-S,typeof N=="function"?-N.apply(this,arguments):-N),O,s)},I,D)};function b(y,S){return S=Math.max(i[0],Math.min(i[1],S)),S===y.k?y:new _e(S,y.x,y.y)}function g(y,S,N){var I=S[0]-N[0]*y.k,D=S[1]-N[1]*y.k;return I===y.x&&D===y.y?y:new _e(y.k,I,D)}function w(y){return[(+y[0][0]+ +y[1][0])/2,(+y[0][1]+ +y[1][1])/2]}function C(y,S,N,I){y.on("start.zoom",function(){E(this,arguments).event(I).start()}).on("interrupt.zoom end.zoom",function(){E(this,arguments).event(I).end()}).tween("zoom",function(){var D=this,O=arguments,R=E(D,O).event(I),B=t.apply(D,O),L=N==null?w(B):typeof N=="function"?N.apply(D,O):N,Z=Math.max(B[1][0]-B[0][0],B[1][1]-B[0][1]),F=D.__zoom,G=typeof S=="function"?S.apply(D,O):S,j=c(F.invert(L).concat(Z/F.k),G.invert(L).concat(Z/G.k));return function(q){if(q===1)q=G;else{var z=j(q),X=Z/z[2];q=new _e(X,L[0]-z[0]*X,L[1]-z[1]*X)}R.zoom(null,q)}})}function E(y,S,N){return!N&&y.__zooming||new M(y,S)}function M(y,S){this.that=y,this.args=S,this.active=0,this.sourceEvent=null,this.extent=t.apply(y,S),this.taps=0}M.prototype={event:function(y){return y&&(this.sourceEvent=y),this},start:function(){return++this.active===1&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(y,S){return this.mouse&&y!=="mouse"&&(this.mouse[1]=S.invert(this.mouse[0])),this.touch0&&y!=="touch"&&(this.touch0[1]=S.invert(this.touch0[0])),this.touch1&&y!=="touch"&&(this.touch1[1]=S.invert(this.touch1[0])),this.that.__zoom=S,this.emit("zoom"),this},end:function(){return--this.active===0&&(delete this.that.__zooming,this.emit("end")),this},emit:function(y){var S=ce(this.that).datum();l.call(y,this.that,new To(y,{sourceEvent:this.sourceEvent,target:m,type:y,transform:this.that.__zoom,dispatch:l}),S)}};function A(y,...S){if(!e.apply(this,arguments))return;var N=E(this,S).event(y),I=this.__zoom,D=Math.max(i[0],Math.min(i[1],I.k*Math.pow(2,o.apply(this,arguments)))),O=fe(y);if(N.wheel)(N.mouse[0][0]!==O[0]||N.mouse[0][1]!==O[1])&&(N.mouse[1]=I.invert(N.mouse[0]=O)),clearTimeout(N.wheel);else{if(I.k===D)return;N.mouse=[O,I.invert(O)],at(this),N.start()}vt(y),N.wheel=setTimeout(R,p),N.zoom("mouse",n(g(b(I,D),N.mouse[0],N.mouse[1]),N.extent,s));function R(){N.wheel=null,N.end()}}function P(y,...S){if(d||!e.apply(this,arguments))return;var N=y.currentTarget,I=E(this,S,!0).event(y),D=ce(y.view).on("mousemove.zoom",L,!0).on("mouseup.zoom",Z,!0),O=fe(y,N),R=y.clientX,B=y.clientY;Ht(y.view),Yn(y),I.mouse=[O,this.__zoom.invert(O)],at(this),I.start();function L(F){if(vt(F),!I.moved){var G=F.clientX-R,j=F.clientY-B;I.moved=G*G+j*j>v}I.event(F).zoom("mouse",n(g(I.that.__zoom,I.mouse[0]=fe(F,N),I.mouse[1]),I.extent,s))}function Z(F){D.on("mousemove.zoom mouseup.zoom",null),Lt(F.view,I.moved),vt(F),I.event(F).end()}}function V(y,...S){if(e.apply(this,arguments)){var N=this.__zoom,I=fe(y.changedTouches?y.changedTouches[0]:y,this),D=N.invert(I),O=N.k*(y.shiftKey?.5:2),R=n(g(b(N,O),I,D),t.apply(this,S),s);vt(y),a>0?ce(this).transition().duration(a).call(C,R,I,y):ce(this).call(m.transform,R,I,y)}}function T(y,...S){if(e.apply(this,arguments)){var N=y.touches,I=N.length,D=E(this,S,y.changedTouches.length===I).event(y),O,R,B,L;for(Yn(y),R=0;R<I;++R)B=N[R],L=fe(B,this),L=[L,this.__zoom.invert(L),B.identifier],D.touch0?!D.touch1&&D.touch0[2]!==L[2]&&(D.touch1=L,D.taps=0):(D.touch0=L,O=!0,D.taps=1+!!u);u&&(u=clearTimeout(u)),O&&(D.taps<2&&(f=L[0],u=setTimeout(function(){u=null},h)),at(this),D.start())}}function H(y,...S){if(this.__zooming){var N=E(this,S).event(y),I=y.changedTouches,D=I.length,O,R,B,L;for(vt(y),O=0;O<D;++O)R=I[O],B=fe(R,this),N.touch0&&N.touch0[2]===R.identifier?N.touch0[0]=B:N.touch1&&N.touch1[2]===R.identifier&&(N.touch1[0]=B);if(R=N.that.__zoom,N.touch1){var Z=N.touch0[0],F=N.touch0[1],G=N.touch1[0],j=N.touch1[1],q=(q=G[0]-Z[0])*q+(q=G[1]-Z[1])*q,z=(z=j[0]-F[0])*z+(z=j[1]-F[1])*z;R=b(R,Math.sqrt(q/z)),B=[(Z[0]+G[0])/2,(Z[1]+G[1])/2],L=[(F[0]+j[0])/2,(F[1]+j[1])/2]}else if(N.touch0)B=N.touch0[0],L=N.touch0[1];else return;N.zoom("touch",n(g(R,B,L),N.extent,s))}}function $(y,...S){if(this.__zooming){var N=E(this,S).event(y),I=y.changedTouches,D=I.length,O,R;for(Yn(y),d&&clearTimeout(d),d=setTimeout(function(){d=null},h),O=0;O<D;++O)R=I[O],N.touch0&&N.touch0[2]===R.identifier?delete N.touch0:N.touch1&&N.touch1[2]===R.identifier&&delete N.touch1;if(N.touch1&&!N.touch0&&(N.touch0=N.touch1,delete N.touch1),N.touch0)N.touch0[1]=this.__zoom.invert(N.touch0[0]);else if(N.end(),N.taps===2&&(R=fe(R,this),Math.hypot(f[0]-R[0],f[1]-R[1])<x)){var B=ce(this).on("dblclick.zoom");B&&B.apply(this,arguments)}}}return m.wheelDelta=function(y){return arguments.length?(o=typeof y=="function"?y:tn(+y),m):o},m.filter=function(y){return arguments.length?(e=typeof y=="function"?y:tn(!!y),m):e},m.touchable=function(y){return arguments.length?(r=typeof y=="function"?y:tn(!!y),m):r},m.extent=function(y){return arguments.length?(t=typeof y=="function"?y:tn([[+y[0][0],+y[0][1]],[+y[1][0],+y[1][1]]]),m):t},m.scaleExtent=function(y){return arguments.length?(i[0]=+y[0],i[1]=+y[1],m):[i[0],i[1]]},m.translateExtent=function(y){return arguments.length?(s[0][0]=+y[0][0],s[1][0]=+y[1][0],s[0][1]=+y[0][1],s[1][1]=+y[1][1],m):[[s[0][0],s[0][1]],[s[1][0],s[1][1]]]},m.constrain=function(y){return arguments.length?(n=y,m):n},m.duration=function(y){return arguments.length?(a=+y,m):a},m.interpolate=function(y){return arguments.length?(c=y,m):c},m.on=function(){var y=l.on.apply(l,arguments);return y===l?m:y},m.clickDistance=function(y){return arguments.length?(v=(y=+y)*y,m):Math.sqrt(v)},m.tapDistance=function(y){return arguments.length?(x=+y,m):x},m}var ge={error001:(e="react")=>`Seems like you have not used ${e==="svelte"?"SvelteFlowProvider":"ReactFlowProvider"} as an ancestor. Help: https://${e}flow.dev/error#001`,error002:()=>"It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",error003:e=>`Node type "${e}" not found. Using fallback type "default".`,error004:()=>"The parent container needs a width and a height to render the graph.",error005:()=>"Only child nodes can use a parent extent.",error006:()=>"Can't create edge. An edge needs a source and a target.",error007:e=>`The old edge with id=${e} does not exist.`,error009:e=>`Marker type "${e}" doesn't exist.`,error008:(e,{id:t,sourceHandle:n,targetHandle:o})=>`Couldn't create edge for ${e} handle id: "${e==="source"?n:o}", edge id: ${t}.`,error010:()=>"Handle: No node id found. Make sure to only use a Handle inside a custom Node.",error011:e=>`Edge type "${e}" not found. Using fallback type "default".`,error012:e=>`Node with id "${e}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,error013:(e="react")=>`It seems that you haven't loaded the styles. Please import '@xyflow/${e}/dist/style.css' or base.css to make sure everything is working properly.`,error014:()=>"useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.",error015:()=>"It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs.",error016:e=>`Edge with id "${e}" does not exist, it may have been removed. This can happen when an edge is deleted before the "onEdgeClick" handler is called.`},St=[[Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY],[Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY]],Lo=["Enter"," ","Escape"],Bo={"node.a11yDescription.default":"Press enter or space to select a node. Press delete to remove it and escape to cancel.","node.a11yDescription.keyboardDisabled":"Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.","node.a11yDescription.ariaLiveMessage":({direction:e,x:t,y:n})=>`Moved selected node ${e}. New position, x: ${t}, y: ${n}`,"edge.a11yDescription.default":"Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.","controls.ariaLabel":"Control Panel","controls.zoomIn.ariaLabel":"Zoom In","controls.zoomOut.ariaLabel":"Zoom Out","controls.fitView.ariaLabel":"Fit View","controls.interactive.ariaLabel":"Toggle Interactivity","minimap.ariaLabel":"Mini Map","handle.ariaLabel":"Handle"},Le;(function(e){e.Strict="strict",e.Loose="loose"})(Le||(Le={}));var ke;(function(e){e.Free="free",e.Vertical="vertical",e.Horizontal="horizontal"})(ke||(ke={}));var qe;(function(e){e.Partial="partial",e.Full="full"})(qe||(qe={}));var Vo={inProgress:!1,isValid:null,from:null,fromHandle:null,fromPosition:null,fromNode:null,to:null,toHandle:null,toPosition:null,toNode:null,pointer:null},Ce;(function(e){e.Bezier="default",e.Straight="straight",e.Step="step",e.SmoothStep="smoothstep",e.SimpleBezier="simplebezier"})(Ce||(Ce={}));var lt;(function(e){e.Arrow="arrow",e.ArrowClosed="arrowclosed"})(lt||(lt={}));var Y;(function(e){e.Left="left",e.Top="top",e.Right="right",e.Bottom="bottom"})(Y||(Y={}));var bs={[Y.Left]:Y.Right,[Y.Right]:Y.Left,[Y.Top]:Y.Bottom,[Y.Bottom]:Y.Top},Fo=e=>!!e&&typeof e=="object"&&"id"in e&&"source"in e&&"target"in e,Ts=e=>!!e&&typeof e=="object"&&"id"in e&&"position"in e&&!("source"in e)&&!("target"in e),Xo=e=>!!e&&typeof e=="object"&&"id"in e&&"internals"in e&&!("source"in e)&&!("target"in e),zs=(e,t,n)=>{if(!e.id)return[];let o=new Set;return n.forEach(r=>{r.source===e.id&&o.add(r.target)}),t.filter(r=>o.has(r.id))},$s=(e,t,n)=>{if(!e.id)return[];let o=new Set;return n.forEach(r=>{r.target===e.id&&o.add(r.source)}),t.filter(r=>o.has(r.id))},rn=(e,t=[0,0])=>{let{width:n,height:o}=ve(e),r=e.origin??t,i=n*r[0],s=o*r[1];return{x:e.position.x-i,y:e.position.y-s}},Kn=(e,t={nodeOrigin:[0,0]})=>{if(e.length===0)return{x:0,y:0,width:0,height:0};let n=!1,o=e.reduce((r,i)=>{let s=typeof i=="string",a=!t.nodeLookup&&!s?i:void 0;return t.nodeLookup&&(a=s?t.nodeLookup.get(i):Xo(i)?i:t.nodeLookup.get(i.id)),a?(n=!0,Jn(r,Gn(a,t.nodeOrigin))):r},{x:1/0,y:1/0,x2:-1/0,y2:-1/0});return n?jn(o):{x:0,y:0,width:0,height:0}},ht=(e,t={})=>{let n={x:1/0,y:1/0,x2:-1/0,y2:-1/0},o=!1;return e.forEach(r=>{(t.filter===void 0||t.filter(r))&&(n=Jn(n,Gn(r)),o=!0)}),o?jn(n):{x:0,y:0,width:0,height:0}},Un=(e,t,[n,o,r]=[0,0,1],i=!1,s=!1)=>{let a=(t.x-n)/r,c=(t.y-o)/r,l=t.width/r,u=t.height/r,f=[];for(let d of e.values()){let{measured:h,selectable:p=!0,hidden:v=!1}=d;if(s&&!p||v)continue;let x=h.width??d.width??d.initialWidth??0,m=h.height??d.height??d.initialHeight??0,{x:b,y:g}=d.internals.positionAbsolute,w=Bs(a,c,l,u,b,g,x,m),C=x*m,E=i&&w>0;(!d.internals.handleBounds||E||w>=C||d.dragging)&&f.push(d)}return f},Yo=(e,t)=>{let n=new Set;return e.forEach(o=>{n.add(o.id)}),t.filter(o=>n.has(o.source)||n.has(o.target))};function Cf(e,t){let n=new Map,o=t?.nodes?new Set(t.nodes.map(r=>r.id)):null;return e.forEach(r=>{let i;if(t?.includeHiddenNodes){let{width:s,height:a}=ve(r);i=s>0&&a>0}else i=!!(r.measured.width&&r.measured.height&&!r.hidden);i&&(!o||o.has(r.id))&&n.set(r.id,r)}),n}async function Rs({nodes:e,width:t,height:n,panZoom:o,minZoom:r,maxZoom:i},s){if(e.size===0)return!0;let a=Cf(e,s),c=ht(a),l=Mt(c,t,n,s?.minZoom??r,s?.maxZoom??i,s?.padding??.1);return await o.setViewport(l,{duration:s?.duration,ease:s?.ease,interpolate:s?.interpolate}),!0}function Zo({nodeId:e,nextPosition:t,nodeLookup:n,nodeOrigin:o=[0,0],nodeExtent:r,onError:i}){let s=n.get(e),a=s.parentId?n.get(s.parentId):void 0,{x:c,y:l}=a?a.internals.positionAbsolute:{x:0,y:0},u=s.origin??o,f=s.extent||r;if(s.extent==="parent"&&!s.expandParent)if(!a)i?.("005",ge.error005());else{let{width:h,height:p}=ve(a);h&&p&&(f=[[c,l],[c+h,l+p]])}else a&&ft(s.extent)&&(f=[[s.extent[0][0]+c,s.extent[0][1]+l],[s.extent[1][0]+c,s.extent[1][1]+l]]);let d=ft(f)?ut(t,f,s.measured):t;return(s.measured.width===void 0||s.measured.height===void 0)&&i?.("015",ge.error015()),{position:{x:d.x-c+(s.measured.width??0)*u[0],y:d.y-l+(s.measured.height??0)*u[1]},positionAbsolute:d}}async function Hs({nodesToRemove:e=[],edgesToRemove:t=[],nodes:n,edges:o,onBeforeDelete:r}){let i=new Set(e.map(d=>d.id)),s=[];for(let d of n){if(d.deletable===!1)continue;let h=i.has(d.id),p=!h&&d.parentId&&s.find(v=>v.id===d.parentId);(h||p)&&s.push(d)}let a=new Set(t.map(d=>d.id)),c=o.filter(d=>d.deletable!==!1),u=Yo(s,c);for(let d of c)a.has(d.id)&&!u.find(p=>p.id===d.id)&&u.push(d);if(!r)return{edges:u,nodes:s};let f=await r({nodes:s,edges:u});return typeof f=="boolean"?f?{edges:u,nodes:s}:{edges:[],nodes:[]}:f}var Et=(e,t=0,n=1)=>Math.min(Math.max(e,t),n),ut=(e={x:0,y:0},t,n)=>({x:Et(e.x,t[0][0],t[1][0]-(n?.width??0)),y:Et(e.y,t[0][1],t[1][1]-(n?.height??0))});function Ls(e,t,n){let{width:o,height:r}=ve(n),{x:i,y:s}=n.internals.positionAbsolute;return ut(e,[[i,s],[i+o,s+r]],t)}var Es=(e,t,n)=>e<t?Et(Math.abs(e-t),1,t)/t:e>n?-Et(Math.abs(e-n),1,t)/t:0,Qn=(e,t,n=15,o=40)=>{let r=Es(e.x,o,t.width-o)*n,i=Es(e.y,o,t.height-o)*n;return[r,i]},Jn=(e,t)=>({x:Math.min(e.x,t.x),y:Math.min(e.y,t.y),x2:Math.max(e.x2,t.x2),y2:Math.max(e.y2,t.y2)}),Ho=({x:e,y:t,width:n,height:o})=>({x:e,y:t,x2:e+n,y2:t+o}),jn=({x:e,y:t,x2:n,y2:o})=>({x:e,y:t,width:n-e,height:o-t}),_t=(e,t=[0,0])=>{let{x:n,y:o}=Xo(e)?e.internals.positionAbsolute:rn(e,t);return{x:n,y:o,width:e.measured?.width??e.width??e.initialWidth??0,height:e.measured?.height??e.height??e.initialHeight??0}},Gn=(e,t=[0,0])=>{let{x:n,y:o}=Xo(e)?e.internals.positionAbsolute:rn(e,t);return{x:n,y:o,x2:n+(e.measured?.width??e.width??e.initialWidth??0),y2:o+(e.measured?.height??e.height??e.initialHeight??0)}},Wo=(e,t)=>jn(Jn(Ho(e),Ho(t))),Bs=(e,t,n,o,r,i,s,a)=>{let c=Math.max(0,Math.min(e+n,r+s)-Math.max(e,r)),l=Math.max(0,Math.min(t+o,i+a)-Math.max(t,i));return Math.ceil(c*l)},sn=(e,t)=>Bs(e.x,e.y,e.width,e.height,t.x,t.y,t.width,t.height),qo=e=>xe(e.width)&&xe(e.height)&&xe(e.x)&&xe(e.y),xe=e=>!isNaN(e)&&isFinite(e),Go=(e,t)=>(n,o)=>{},Ct=(e,t=[1,1])=>({x:t[0]*Math.round(e.x/t[0]),y:t[1]*Math.round(e.y/t[1])}),Nt=({x:e,y:t},[n,o,r],i=!1,s=[1,1])=>{let a={x:(e-n)/r,y:(t-o)/r};return i?Ct(a,s):a},dt=({x:e,y:t},[n,o,r])=>({x:e*r+n,y:t*r+o});function bt(e,t){if(typeof e=="number")return Math.floor((t-t/(1+e))*.5);if(typeof e=="string"&&e.endsWith("px")){let n=parseFloat(e);if(!Number.isNaN(n))return Math.floor(n)}if(typeof e=="string"&&e.endsWith("%")){let n=parseFloat(e);if(!Number.isNaN(n))return Math.floor(t*n*.01)}return console.error(`The padding value "${e}" is invalid. Please provide a number or a string with a valid unit (px or %).`),0}function Nf(e,t,n){if(typeof e=="string"||typeof e=="number"){let o=bt(e,n),r=bt(e,t);return{top:o,right:r,bottom:o,left:r,x:r*2,y:o*2}}if(typeof e=="object"){let o=bt(e.top??e.y??0,n),r=bt(e.bottom??e.y??0,n),i=bt(e.left??e.x??0,t),s=bt(e.right??e.x??0,t);return{top:o,right:s,bottom:r,left:i,x:i+s,y:o+r}}return{top:0,right:0,bottom:0,left:0,x:0,y:0}}function Mf(e,t,n,o,r,i){let{x:s,y:a}=dt(e,[t,n,o]),{x:c,y:l}=dt({x:e.x+e.width,y:e.y+e.height},[t,n,o]),u=r-c,f=i-l;return{left:Math.floor(s),top:Math.floor(a),right:Math.floor(u),bottom:Math.floor(f)}}var Mt=(e,t,n,o,r,i)=>{let s=Nf(i,t,n),a=(t-s.x)/e.width,c=(n-s.y)/e.height,l=Math.min(a,c),u=Et(l,o,r),f=e.x+e.width/2,d=e.y+e.height/2,h=t/2-f*u,p=n/2-d*u,v=Mf(e,h,p,u,t,n),x={left:Math.min(v.left-s.left,0),top:Math.min(v.top-s.top,0),right:Math.min(v.right-s.right,0),bottom:Math.min(v.bottom-s.bottom,0)};return{x:h-x.left+x.right,y:p-x.top+x.bottom,zoom:u}},It=()=>typeof navigator<"u"&&navigator?.userAgent?.indexOf("Mac")>=0;function ft(e){return e!=null&&e!=="parent"}function ve(e){return{width:e.measured?.width??e.width??e.initialWidth??0,height:e.measured?.height??e.height??e.initialHeight??0}}function eo(e){return(e.measured?.width??e.width??e.initialWidth)!==void 0&&(e.measured?.height??e.height??e.initialHeight)!==void 0}function Ko(e,t={width:0,height:0},n,o,r){let i={...e},s=o.get(n);if(s){let a=s.origin||r;i.x+=s.internals.positionAbsolute.x-(t.width??0)*a[0],i.y+=s.internals.positionAbsolute.y-(t.height??0)*a[1]}return i}function Uo(e,t){if(e.size!==t.size)return!1;for(let n of e)if(!t.has(n))return!1;return!0}function Vs(){let e,t;return{promise:new Promise((o,r)=>{e=o,t=r}),resolve:e,reject:t}}function Fs(e){return{...Bo,...e||{}}}function Qo(e,t){if(!e&&!t)return!0;if(!e||!t||e.size!==t.size)return!1;if(!e.size&&!t.size)return!0;for(let n of e.keys())if(!t.has(n))return!1;return!0}function an(e,t,n){if(!n)return;let o=[];e.forEach((r,i)=>{t?.has(i)||o.push(r)}),o.length&&n(o)}function Jo(e){return e===null?null:e?"valid":"invalid"}function on(e,{snapGrid:t=[0,0],snapToGrid:n=!1,transform:o,containerBounds:r}){let{x:i,y:s}=we(e),a=Nt({x:i-(r?.left??0),y:s-(r?.top??0)},o),{x:c,y:l}=n?Ct(a,t):a;return{xSnapped:c,ySnapped:l,...a}}var to=e=>({width:e.offsetWidth,height:e.offsetHeight}),jo=e=>e?.getRootNode?.()||window?.document,If=["INPUT","SELECT","TEXTAREA"];function er(e){let t=e.composedPath?.()?.[0]||e.target;return t?.nodeType!==1?!1:If.includes(t.nodeName)||t.hasAttribute("contenteditable")||!!t.closest(".nokey")}var tr=e=>"clientX"in e,we=(e,t)=>{let n=tr(e),o=n?e.clientX:e.touches?.[0].clientX,r=n?e.clientY:e.touches?.[0].clientY;return{x:o-(t?.left??0),y:r-(t?.top??0)}},Ss=(e,t,n,o,r)=>{let i=t.querySelectorAll(`.${e}`);return!i||!i.length?null:Array.from(i).map(s=>{let a=s.getBoundingClientRect();return{id:s.getAttribute("data-handleid"),type:e,nodeId:r,position:s.getAttribute("data-handlepos"),x:(a.left-n.left)/o,y:(a.top-n.top)/o,...to(s)}})};function cn({sourceX:e,sourceY:t,targetX:n,targetY:o,sourceControlX:r,sourceControlY:i,targetControlX:s,targetControlY:a}){let c=e*.125+r*.375+s*.375+n*.125,l=t*.125+i*.375+a*.375+o*.125,u=Math.abs(c-e),f=Math.abs(l-t);return[c,l,u,f]}function Wn(e,t){return e>=0?.5*e:t*25*Math.sqrt(-e)}function _s({pos:e,x1:t,y1:n,x2:o,y2:r,c:i}){switch(e){case Y.Left:return[t-Wn(t-o,i),n];case Y.Right:return[t+Wn(o-t,i),n];case Y.Top:return[t,n-Wn(n-r,i)];case Y.Bottom:return[t,n+Wn(r-n,i)]}}function ln({sourceX:e,sourceY:t,sourcePosition:n=Y.Bottom,targetX:o,targetY:r,targetPosition:i=Y.Top,curvature:s=.25}){let[a,c]=_s({pos:n,x1:e,y1:t,x2:o,y2:r,c:s}),[l,u]=_s({pos:i,x1:o,y1:r,x2:e,y2:t,c:s}),[f,d,h,p]=cn({sourceX:e,sourceY:t,targetX:o,targetY:r,sourceControlX:a,sourceControlY:c,targetControlX:l,targetControlY:u});return[`M${e},${t} C${a},${c} ${l},${u} ${o},${r}`,f,d,h,p]}function no({sourceX:e,sourceY:t,targetX:n,targetY:o}){let r=Math.abs(n-e)/2,i=n<e?n+r:n-r,s=Math.abs(o-t)/2,a=o<t?o+s:o-s;return[i,a,r,s]}function Xs({sourceNode:e,targetNode:t,selected:n=!1,zIndex:o=0,elevateOnSelect:r=!1,zIndexMode:i="basic"}){if(i==="manual")return o;let s=r&&n?o+1e3:o,a=Math.max(e.parentId||r&&e.selected?e.internals.z:0,t.parentId||r&&t.selected?t.internals.z:0);return s+a}function Ys({sourceNode:e,targetNode:t,width:n,height:o,transform:r}){let i=Jn(Gn(e),Gn(t));i.x===i.x2&&(i.x2+=1),i.y===i.y2&&(i.y2+=1);let s={x:-r[0]/r[2],y:-r[1]/r[2],width:n/r[2],height:o/r[2]};return sn(s,jn(i))>0}var Zs=({source:e,sourceHandle:t,target:n,targetHandle:o})=>`xy-edge__${e}${t||""}-${n}${o||""}`,kf=(e,t)=>t.some(n=>n.source===e.source&&n.target===e.target&&(n.sourceHandle===e.sourceHandle||!n.sourceHandle&&!e.sourceHandle)&&(n.targetHandle===e.targetHandle||!n.targetHandle&&!e.targetHandle)),Ws=(e,t,n={})=>{if(!e.source||!e.target)return n.onError?.("006",ge.error006()),t;let o=n.getEdgeId||Zs,r;return Fo(e)?r={...e}:r={...e,id:o(e)},kf(r,t)?t:(r.sourceHandle===null&&delete r.sourceHandle,r.targetHandle===null&&delete r.targetHandle,t.concat(r))},qs=(e,t,n,o={shouldReplaceId:!0})=>{let{id:r,...i}=e;if(!t.source||!t.target)return o.onError?.("006",ge.error006()),n;if(!n.find(l=>l.id===e.id))return o.onError?.("007",ge.error007(r)),n;let a=o.getEdgeId||Zs,c={...i,id:o.shouldReplaceId?a(t):r,source:t.source,target:t.target,sourceHandle:t.sourceHandle,targetHandle:t.targetHandle};return n.filter(l=>l.id!==r).concat(c)};function un({sourceX:e,sourceY:t,targetX:n,targetY:o}){let[r,i,s,a]=no({sourceX:e,sourceY:t,targetX:n,targetY:o});return[`M ${e},${t}L ${n},${o}`,r,i,s,a]}var Cs={[Y.Left]:{x:-1,y:0},[Y.Right]:{x:1,y:0},[Y.Top]:{x:0,y:-1},[Y.Bottom]:{x:0,y:1}},Pf=({source:e,sourcePosition:t=Y.Bottom,target:n})=>t===Y.Left||t===Y.Right?e.x<n.x?{x:1,y:0}:{x:-1,y:0}:e.y<n.y?{x:0,y:1}:{x:0,y:-1},Ns=(e,t)=>Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));function Af({source:e,sourcePosition:t=Y.Bottom,target:n,targetPosition:o=Y.Top,center:r,offset:i,stepPosition:s}){let a=Cs[t],c=Cs[o],l={x:e.x+a.x*i,y:e.y+a.y*i},u={x:n.x+c.x*i,y:n.y+c.y*i},f=Pf({source:l,sourcePosition:t,target:u}),d=f.x!==0?"x":"y",h=f[d],p=[],v,x,m={x:0,y:0},b={x:0,y:0},[,,g,w]=no({sourceX:e.x,sourceY:e.y,targetX:n.x,targetY:n.y});if(a[d]*c[d]===-1){d==="x"?(v=r.x??l.x+(u.x-l.x)*s,x=r.y??(l.y+u.y)/2):(v=r.x??(l.x+u.x)/2,x=r.y??l.y+(u.y-l.y)*s);let A=[{x:v,y:l.y},{x:v,y:u.y}],P=[{x:l.x,y:x},{x:u.x,y:x}];a[d]===h?p=d==="x"?A:P:p=d==="x"?P:A}else{let A=[{x:l.x,y:u.y}],P=[{x:u.x,y:l.y}];if(d==="x"?p=a.x===h?P:A:p=a.y===h?A:P,t===o){let y=Math.abs(e[d]-n[d]);if(y<=i){let S=Math.min(i-1,i-y);a[d]===h?m[d]=(l[d]>e[d]?-1:1)*S:b[d]=(u[d]>n[d]?-1:1)*S}}if(t!==o){let y=d==="x"?"y":"x",S=a[d]===c[y],N=l[y]>u[y],I=l[y]<u[y];(a[d]===1&&(!S&&N||S&&I)||a[d]!==1&&(!S&&I||S&&N))&&(p=d==="x"?A:P)}let V={x:l.x+m.x,y:l.y+m.y},T={x:u.x+b.x,y:u.y+b.y},H=Math.max(Math.abs(V.x-p[0].x),Math.abs(T.x-p[0].x)),$=Math.max(Math.abs(V.y-p[0].y),Math.abs(T.y-p[0].y));H>=$?(v=(V.x+T.x)/2,x=p[0].y):(v=p[0].x,x=(V.y+T.y)/2)}let C={x:l.x+m.x,y:l.y+m.y},E={x:u.x+b.x,y:u.y+b.y};return[[e,...C.x!==p[0].x||C.y!==p[0].y?[C]:[],...p,...E.x!==p[p.length-1].x||E.y!==p[p.length-1].y?[E]:[],n],v,x,g,w]}function Df(e,t,n,o){let r=Math.min(Ns(e,t)/2,Ns(t,n)/2,o),{x:i,y:s}=t;if(e.x===i&&i===n.x||e.y===s&&s===n.y)return`L${i} ${s}`;if(e.y===s){let l=e.x<n.x?-1:1,u=e.y<n.y?1:-1;return`L ${i+r*l},${s}Q ${i},${s} ${i},${s+r*u}`}let a=e.x<n.x?1:-1,c=e.y<n.y?-1:1;return`L ${i},${s+r*c}Q ${i},${s} ${i+r*a},${s}`}function kt({sourceX:e,sourceY:t,sourcePosition:n=Y.Bottom,targetX:o,targetY:r,targetPosition:i=Y.Top,borderRadius:s=5,centerX:a,centerY:c,offset:l=20,stepPosition:u=.5}){let[f,d,h,p,v]=Af({source:{x:e,y:t},sourcePosition:n,target:{x:o,y:r},targetPosition:i,center:{x:a,y:c},offset:l,stepPosition:u}),x=`M${f[0].x} ${f[0].y}`;for(let m=1;m<f.length-1;m++)x+=Df(f[m-1],f[m],f[m+1],s);return x+=`L${f[f.length-1].x} ${f[f.length-1].y}`,[x,d,h,p,v]}function Ms(e){return e&&!!(e.internals.handleBounds||e.handles?.length)&&!!(e.measured.width||e.width||e.initialWidth)}function Gs(e){let{sourceNode:t,targetNode:n}=e;if(!Ms(t)||!Ms(n))return null;let o=t.internals.handleBounds||Is(t.handles),r=n.internals.handleBounds||Is(n.handles),i=ks(o?.source??[],e.sourceHandle),s=ks(e.connectionMode===Le.Strict?r?.target??[]:(r?.target??[]).concat(r?.source??[]),e.targetHandle);if(!i||!s)return e.onError?.("008",ge.error008(i?"target":"source",{id:e.id,sourceHandle:e.sourceHandle,targetHandle:e.targetHandle})),null;let a=i?.position||Y.Bottom,c=s?.position||Y.Top,l=Ge(t,i,a),u=Ge(n,s,c);return{sourceX:l.x,sourceY:l.y,targetX:u.x,targetY:u.y,sourcePosition:a,targetPosition:c}}function Is(e){if(!e)return null;let t=[],n=[];for(let o of e)o.width=o.width??1,o.height=o.height??1,o.type==="source"?t.push(o):o.type==="target"&&n.push(o);return{source:t,target:n}}function Ge(e,t,n=Y.Left,o=!1){let r=(t?.x??0)+e.internals.positionAbsolute.x,i=(t?.y??0)+e.internals.positionAbsolute.y,{width:s,height:a}=t??ve(e);if(o)return{x:r+s/2,y:i+a/2};switch(t?.position??n){case Y.Top:return{x:r+s/2,y:i};case Y.Right:return{x:r+s,y:i+a/2};case Y.Bottom:return{x:r+s/2,y:i+a};case Y.Left:return{x:r,y:i+a/2}}}function ks(e,t){return e&&(t?e.find(n=>n.id===t):e[0])||null}function oo(e,t){return e?typeof e=="string"?e:`${t?`${t}__`:""}${Object.keys(e).sort().map(o=>`${o}=${e[o]}`).join("&")}`:""}function Ks(e,{id:t,defaultColor:n,defaultMarkerStart:o,defaultMarkerEnd:r}){let i=new Set;return e.reduce((s,a)=>([a.markerStart||o,a.markerEnd||r].forEach(c=>{if(c&&typeof c=="object"){let l=oo(c,t);i.has(l)||(s.push({id:l,color:c.color||n,...c}),i.add(l))}}),s),[]).sort((s,a)=>s.id.localeCompare(a.id))}function Us(e,t,n,o,r){let i=.5;r==="start"?i=0:r==="end"&&(i=1);let s=[(e.x+e.width*i)*t.zoom+t.x,e.y*t.zoom+t.y-o],a=[-100*i,-100];switch(n){case Y.Right:s=[(e.x+e.width)*t.zoom+t.x+o,(e.y+e.height*i)*t.zoom+t.y],a=[0,-100*i];break;case Y.Bottom:s[1]=(e.y+e.height)*t.zoom+t.y+o,a[1]=0;break;case Y.Left:s=[e.x*t.zoom+t.x-o,(e.y+e.height*i)*t.zoom+t.y],a=[-100,-100*i];break}return`translate(${s[0]}px, ${s[1]}px) translate(${a[0]}%, ${a[1]}%)`}var Of={left:0,center:50,right:100},Tf={top:0,center:50,bottom:100};function Qs(e,t,n,o="center",r="center"){return`translate(${e}px, ${t}px) scale(${1/n}) translate(${-(Of[o]??50)}%, ${-(Tf[r]??50)}%)`}var Js=1e3,zf=10,nr={nodeOrigin:[0,0],nodeExtent:St,elevateNodesOnSelect:!0,zIndexMode:"basic",defaults:{}},$f={...nr,checkEquality:!0};function or(e,t){let n={...e};for(let o in t)t[o]!==void 0&&(n[o]=t[o]);return n}function js(e,t,n){let o=or(nr,n);for(let r of e.values())if(r.parentId)ir(r,e,t,o);else{let i=rn(r,o.nodeOrigin),s=ft(r.extent)?r.extent:o.nodeExtent,a=ut(i,s,ve(r));r.internals.positionAbsolute=a}}function Rf(e,t){if(!e.handles)return e.measured?t?.internals.handleBounds:void 0;let n=[],o=[];for(let r of e.handles){let i={id:r.id,width:r.width??1,height:r.height??1,nodeId:e.id,x:r.x,y:r.y,position:r.position,type:r.type};r.type==="source"?n.push(i):r.type==="target"&&o.push(i)}return{source:n,target:o}}function rr(e){return e==="manual"}function ro(e,t,n,o={}){let r=or($f,o),i={i:0},s=new Map(t),a=r?.elevateNodesOnSelect&&!rr(r.zIndexMode)?Js:0,c=e.length>0,l=!1;t.clear(),n.clear();for(let u of e){let f=s.get(u.id);if(r.checkEquality&&u===f?.internals.userNode)t.set(u.id,f);else{let d=rn(u,r.nodeOrigin),h=ft(u.extent)?u.extent:r.nodeExtent,p=ut(d,h,ve(u));f={...r.defaults,...u,measured:{width:u.measured?.width,height:u.measured?.height},internals:{positionAbsolute:p,handleBounds:Rf(u,f),z:ea(u,a,r.zIndexMode),userNode:u}},t.set(u.id,f)}(f.measured===void 0||f.measured.width===void 0||f.measured.height===void 0)&&!f.hidden&&(c=!1),u.parentId&&ir(f,t,n,o,i),l||=u.selected??!1}return{nodesInitialized:c,hasSelectedNodes:l}}function Hf(e,t){if(!e.parentId)return;let n=t.get(e.parentId);n?n.set(e.id,e):t.set(e.parentId,new Map([[e.id,e]]))}function ir(e,t,n,o,r){let{elevateNodesOnSelect:i,nodeOrigin:s,nodeExtent:a,zIndexMode:c}=or(nr,o),l=e.parentId,u=t.get(l);if(!u){console.warn(`Parent node ${l} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);return}Hf(e,n),r&&!u.parentId&&u.internals.rootParentIndex===void 0&&c==="auto"&&(u.internals.rootParentIndex=++r.i,u.internals.z=u.internals.z+r.i*zf),r&&u.internals.rootParentIndex!==void 0&&(r.i=u.internals.rootParentIndex);let f=i&&!rr(c)?Js:0,{x:d,y:h,z:p}=Lf(e,u,s,a,f,c),{positionAbsolute:v}=e.internals,x=d!==v.x||h!==v.y;(x||p!==e.internals.z)&&t.set(e.id,{...e,internals:{...e.internals,positionAbsolute:x?{x:d,y:h}:v,z:p}})}function ea(e,t,n){let o=xe(e.zIndex)?e.zIndex:0;return rr(n)?o:o+(e.selected?t:0)}function Lf(e,t,n,o,r,i){let{x:s,y:a}=t.internals.positionAbsolute,c=ve(e),l=rn(e,n),u=ft(e.extent)?ut(l,e.extent,c):l,f=ut({x:s+u.x,y:a+u.y},o,c);e.extent==="parent"&&(f=Ls(f,c,t));let d=ea(e,r,i),h=t.internals.z??0;return{x:f.x,y:f.y,z:h>=d?h+1:d}}function io(e,t,n,o=[0,0]){let r=[],i=new Map;for(let s of e){let a=t.get(s.parentId);if(!a)continue;let c=i.get(s.parentId)?.expandedRect??_t(a),l=Wo(c,s.rect);i.set(s.parentId,{expandedRect:l,parent:a})}return i.size>0&&i.forEach(({expandedRect:s,parent:a},c)=>{let l=a.internals.positionAbsolute,u=ve(a),f=a.origin??o,d=s.x<l.x?Math.round(Math.abs(l.x-s.x)):0,h=s.y<l.y?Math.round(Math.abs(l.y-s.y)):0,p=Math.max(u.width,Math.round(s.width)),v=Math.max(u.height,Math.round(s.height)),x=(p-u.width)*f[0],m=(v-u.height)*f[1];(d>0||h>0||x||m)&&(r.push({id:c,type:"position",position:{x:a.position.x-d+x,y:a.position.y-h+m}}),n.get(c)?.forEach(b=>{e.some(g=>g.id===b.id)||r.push({id:b.id,type:"position",position:{x:b.position.x+d,y:b.position.y+h}})})),(u.width<s.width||u.height<s.height||d||h)&&r.push({id:c,type:"dimensions",setAttributes:!0,dimensions:{width:p+(d?f[0]*d-x:0),height:v+(h?f[1]*h-m:0)}})}),r}function ta(e,t,n,o,r,i,s){let a=o?.querySelector(".xyflow__viewport"),c=!1;if(!a)return{changes:[],updatedInternals:c};let l=[],u=window.getComputedStyle(a),{m22:f}=new window.DOMMatrixReadOnly(u.transform),d=[];for(let h of e.values()){let p=t.get(h.id);if(!p)continue;if(p.hidden){t.set(p.id,{...p,internals:{...p.internals,handleBounds:void 0}}),c=!0;continue}let v=to(h.nodeElement),x=p.measured.width!==v.width||p.measured.height!==v.height;if(!!(v.width&&v.height&&(x||!p.internals.handleBounds||h.force))){let b=h.nodeElement.getBoundingClientRect(),g=ft(p.extent)?p.extent:i,{positionAbsolute:w}=p.internals;if(p.parentId&&p.extent==="parent"){let E=t.get(p.parentId);E&&(w=Ls(w,v,E))}else g&&(w=ut(w,g,v));let C={...p,measured:v,internals:{...p.internals,positionAbsolute:w,handleBounds:{source:Ss("source",h.nodeElement,b,f,p.id),target:Ss("target",h.nodeElement,b,f,p.id)}}};t.set(p.id,C),p.parentId&&ir(C,t,n,{nodeOrigin:r,zIndexMode:s}),c=!0,x&&(l.push({id:p.id,type:"dimensions",dimensions:v}),p.expandParent&&p.parentId&&d.push({id:p.id,parentId:p.parentId,rect:_t(C,r)}))}}if(d.length>0){let h=io(d,t,n,r);l.push(...h)}return{changes:l,updatedInternals:c}}async function na({delta:e,panZoom:t,transform:n,translateExtent:o,width:r,height:i}){if(!t||!e.x&&!e.y)return!1;let s=await t.setViewportConstrained({x:n[0]+e.x,y:n[1]+e.y,zoom:n[2]},[[0,0],[r,i]],o);return!!s&&(s.x!==n[0]||s.y!==n[1]||s.k!==n[2])}function Ps(e,t,n,o,r,i){let s=r,a=o.get(s)||new Map;o.set(s,a.set(n,t)),s=`${r}-${e}`;let c=o.get(s)||new Map;if(o.set(s,c.set(n,t)),i){s=`${r}-${e}-${i}`;let l=o.get(s)||new Map;o.set(s,l.set(n,t))}}function sr(e,t,n){e.clear(),t.clear();for(let o of n){let{source:r,target:i,sourceHandle:s=null,targetHandle:a=null}=o,c={edgeId:o.id,source:r,target:i,sourceHandle:s,targetHandle:a},l=`${r}-${s}--${i}-${a}`,u=`${i}-${a}--${r}-${s}`;Ps("source",c,u,e,r,s),Ps("target",c,l,e,i,a),t.set(o.id,o)}}function oa(e,t){if(e===null||t===null)return!1;let n=Array.isArray(e)?e:[e],o=Array.isArray(t)?t:[t];if(n.length!==o.length)return!1;for(let r=0;r<n.length;r++)if(n[r].id!==o[r].id||n[r].type!==o[r].type||!Object.is(n[r].data,o[r].data))return!1;return!0}function ra(e,t){if(!e.parentId)return!1;let n=t.get(e.parentId);return n?n.selected?!0:ra(n,t):!1}function As(e,t,n){let o=e;do{if(o?.matches?.(t))return!0;if(o===n)return!1;o=o?.parentElement}while(o);return!1}function Bf(e,t,n,o){let r=new Map;for(let[i,s]of e)if((s.selected||s.id===o)&&(!s.parentId||!ra(s,e))&&(s.draggable||t&&typeof s.draggable>"u")){let a=e.get(i);a&&r.set(i,{id:i,position:a.position||{x:0,y:0},distance:{x:n.x-a.internals.positionAbsolute.x,y:n.y-a.internals.positionAbsolute.y},extent:a.extent,parentId:a.parentId,origin:a.origin,expandParent:a.expandParent,internals:{positionAbsolute:a.internals.positionAbsolute||{x:0,y:0}},measured:{width:a.measured.width??0,height:a.measured.height??0}})}return r}function zo({nodeId:e,dragItems:t,nodeLookup:n,dragging:o=!0}){let r=[];for(let[s,a]of t){let c=n.get(s)?.internals.userNode;c&&r.push({...c,position:a.position,dragging:o})}if(!e)return[r[0],r];let i=n.get(e)?.internals.userNode;return[i?{...i,position:t.get(e)?.position||i.position,dragging:o}:r[0],r]}function Vf({dragItems:e,snapGrid:t,x:n,y:o}){let r=e.values().next().value;if(!r)return null;let i={x:n-r.distance.x,y:o-r.distance.y},s=Ct(i,t);return{x:s.x-i.x,y:s.y-i.y}}function ia({onNodeMouseDown:e,getStoreItems:t,onDragStart:n,onDrag:o,onDragStop:r}){let i={x:null,y:null},s=0,a=new Map,c=!1,l={x:0,y:0},u=null,f=!1,d=null,h=!1,p=!1,v=null;function x({noDragClassName:b,handleSelector:g,domNode:w,isSelectable:C,nodeId:E,nodeClickDistance:M=0}){d=ce(w);function A({x:H,y:$}){let{nodeLookup:y,nodeExtent:S,snapGrid:N,snapToGrid:I,nodeOrigin:D,onNodeDrag:O,onSelectionDrag:R,onError:B,updateNodePositions:L}=t();i={x:H,y:$};let Z=!1,F=a.size>1,G=F&&S?Ho(ht(a)):null,j=F&&I?Vf({dragItems:a,snapGrid:N,x:H,y:$}):null;for(let[q,z]of a){if(!y.has(q))continue;let X={x:H-z.distance.x,y:$-z.distance.y};I&&(X=j?{x:Math.round(X.x+j.x),y:Math.round(X.y+j.y)}:Ct(X,N));let J=null;if(F&&S&&!z.extent&&G){let{positionAbsolute:U}=z.internals,ee=U.x-G.x+S[0][0],te=U.x+z.measured.width-G.x2+S[1][0],re=U.y-G.y+S[0][1],le=U.y+z.measured.height-G.y2+S[1][1];J=[[ee,re],[te,le]]}let{position:Q,positionAbsolute:W}=Zo({nodeId:q,nextPosition:X,nodeLookup:y,nodeExtent:J||S,nodeOrigin:D,onError:B});Z=Z||z.position.x!==Q.x||z.position.y!==Q.y,z.position=Q,z.internals.positionAbsolute=W}if(p=p||Z,!!Z&&(L(a,!0),v&&(o||O||!E&&R))){let[q,z]=zo({nodeId:E,dragItems:a,nodeLookup:y});o?.(v,a,q,z),O?.(v,q,z),E||R?.(v,z)}}async function P(){if(!u)return;let{transform:H,panBy:$,autoPanSpeed:y,autoPanOnNodeDrag:S}=t();if(!S){c=!1,cancelAnimationFrame(s);return}let[N,I]=Qn(l,u,y);(N!==0||I!==0)&&(i.x=(i.x??0)-N/H[2],i.y=(i.y??0)-I/H[2],await $({x:N,y:I})&&A(i)),s=requestAnimationFrame(P)}function V(H){let{nodeLookup:$,multiSelectionActive:y,nodesDraggable:S,transform:N,snapGrid:I,snapToGrid:D,selectNodesOnDrag:O,onNodeDragStart:R,onSelectionDragStart:B,unselectNodesAndEdges:L}=t();f=!0,(!O||!C)&&!y&&E&&($.get(E)?.selected||L()),C&&O&&E&&e?.(E);let Z=on(H.sourceEvent,{transform:N,snapGrid:I,snapToGrid:D,containerBounds:u});if(i=Z,a=Bf($,S,Z,E),a.size>0&&(n||R||!E&&B)){let[F,G]=zo({nodeId:E,dragItems:a,nodeLookup:$});n?.(H.sourceEvent,a,F,G),R?.(H.sourceEvent,F,G),E||B?.(H.sourceEvent,G)}}let T=_n().clickDistance(M).on("start",H=>{let{domNode:$,nodeDragThreshold:y,transform:S,snapGrid:N,snapToGrid:I}=t();u=$?.getBoundingClientRect()||null,h=!1,p=!1,v=H.sourceEvent,y===0&&V(H),i=on(H.sourceEvent,{transform:S,snapGrid:N,snapToGrid:I,containerBounds:u}),l=we(H.sourceEvent,u)}).on("drag",H=>{let{autoPanOnNodeDrag:$,transform:y,snapGrid:S,snapToGrid:N,nodeDragThreshold:I,nodeLookup:D}=t(),O=on(H.sourceEvent,{transform:y,snapGrid:S,snapToGrid:N,containerBounds:u});if(v=H.sourceEvent,(H.sourceEvent.type==="touchmove"&&H.sourceEvent.touches.length>1||E&&!D.has(E))&&(h=!0),!h){if(!c&&$&&f&&(c=!0,P()),!f){let R=we(H.sourceEvent,u),B=R.x-l.x,L=R.y-l.y;Math.sqrt(B*B+L*L)>I&&V(H)}(i.x!==O.xSnapped||i.y!==O.ySnapped)&&a&&f&&(l=we(H.sourceEvent,u),A(O))}}).on("end",H=>{if(!f||h){h&&a.size>0&&t().updateNodePositions(a,!1);return}if(c=!1,f=!1,cancelAnimationFrame(s),a.size>0){let{nodeLookup:$,updateNodePositions:y,onNodeDragStop:S,onSelectionDragStop:N}=t();if(p&&(y(a,!1),p=!1),r||S||!E&&N){let[I,D]=zo({nodeId:E,dragItems:a,nodeLookup:$,dragging:!1});r?.(H.sourceEvent,a,I,D),S?.(H.sourceEvent,I,D),E||N?.(H.sourceEvent,D)}}}).filter(H=>{let $=H.target;return!H.button&&(!b||!As($,`.${b}`,w))&&(!g||As($,g,w))});d.call(T)}function m(){d?.on(".drag",null)}return{update:x,destroy:m}}function Ff(e,t,n){let o=[],r={x:e.x-n,y:e.y-n,width:n*2,height:n*2};for(let i of t.values())sn(r,_t(i))>0&&o.push(i);return o}var Xf=250;function Yf(e,t,n,o){let r=[],i=1/0,s=Ff(e,n,t+Xf);for(let a of s){let c=[...a.internals.handleBounds?.source??[],...a.internals.handleBounds?.target??[]];for(let l of c){if(o.nodeId===l.nodeId&&o.type===l.type&&o.id===l.id)continue;let{x:u,y:f}=Ge(a,l,l.position,!0),d=Math.sqrt(Math.pow(u-e.x,2)+Math.pow(f-e.y,2));d>t||(d<i?(r=[{...l,x:u,y:f}],i=d):d===i&&r.push({...l,x:u,y:f}))}}if(!r.length)return null;if(r.length>1){let a=o.type==="source"?"target":"source";return r.find(c=>c.type===a)??r[0]}return r[0]}function sa(e,t,n,o,r,i=!1){let s=o.get(e);if(!s)return null;let a=r==="strict"?s.internals.handleBounds?.[t]:[...s.internals.handleBounds?.source??[],...s.internals.handleBounds?.target??[]],c=(n?a?.find(l=>l.id===n):a?.[0])??null;return c&&i?{...c,...Ge(s,c,c.position,!0)}:c}function aa(e,t){return e||(t?.classList.contains("target")?"target":t?.classList.contains("source")?"source":null)}function Zf(e,t){let n=null;return t?n=!0:e&&!t&&(n=!1),n}var ca=()=>!0;function Wf(e,{connectionMode:t,connectionRadius:n,handleId:o,nodeId:r,edgeUpdaterType:i,isTarget:s,domNode:a,nodeLookup:c,lib:l,autoPanOnConnect:u,flowId:f,panBy:d,cancelConnection:h,onConnectStart:p,onConnect:v,onConnectEnd:x,isValidConnection:m=ca,onReconnectEnd:b,updateConnection:g,getTransform:w,getFromHandle:C,autoPanSpeed:E,dragThreshold:M=1,handleDomNode:A}){let P=jo(e.target),V=0,T,{x:H,y:$}=we(e),y=aa(i,A),S=a?.getBoundingClientRect(),N=!1;if(!S||!y)return;let I=sa(r,y,o,c,t);if(!I)return;let D=we(e,S),O=!1,R=null,B=!1,L=null;function Z(){if(!u||!S)return;let[Q,W]=Qn(D,S,E);d({x:Q,y:W}),V=requestAnimationFrame(Z)}let F={...I,nodeId:r,type:y,position:I.position},G=c.get(r),q={inProgress:!0,isValid:null,from:Ge(G,F,Y.Left,!0),fromHandle:F,fromPosition:F.position,fromNode:G,to:D,toHandle:null,toPosition:bs[F.position],toNode:null,pointer:D};function z(){N=!0,g(q),p?.(e,{nodeId:r,handleId:o,handleType:y})}M===0&&z();function X(Q){if(!N){let{x:le,y:Ae}=we(Q),Ne=le-H,Me=Ae-$;if(!(Ne*Ne+Me*Me>M*M))return;z()}if(!C()||!F){J(Q);return}let W=w();D=we(Q,S),T=Yf(Nt(D,W,!1,[1,1]),n,c,F),O||(Z(),O=!0);let U=la(Q,{handle:T,connectionMode:t,fromNodeId:r,fromHandleId:o,fromType:s?"target":"source",isValidConnection:m,doc:P,lib:l,flowId:f,nodeLookup:c});L=U.handleDomNode,R=U.connection,B=Zf(!!T,U.isValid);let ee=c.get(r),te=ee?Ge(ee,F,Y.Left,!0):q.from,re={...q,from:te,isValid:B,to:U.toHandle&&B?dt({x:U.toHandle.x,y:U.toHandle.y},W):D,toHandle:U.toHandle,toPosition:B&&U.toHandle?U.toHandle.position:bs[F.position],toNode:U.toHandle?c.get(U.toHandle.nodeId):null,pointer:D};g(re),q=re}function J(Q){if(!("touches"in Q&&Q.touches.length>0)){if(N){(T||L)&&R&&B&&v?.(R);let{inProgress:W,...U}=q,ee={...U,toPosition:q.toHandle?q.toPosition:null};x?.(Q,ee),i&&b?.(Q,ee)}h(),cancelAnimationFrame(V),O=!1,B=!1,R=null,L=null,P.removeEventListener("mousemove",X),P.removeEventListener("mouseup",J),P.removeEventListener("touchmove",X),P.removeEventListener("touchend",J)}}P.addEventListener("mousemove",X),P.addEventListener("mouseup",J),P.addEventListener("touchmove",X),P.addEventListener("touchend",J)}function la(e,{handle:t,connectionMode:n,fromNodeId:o,fromHandleId:r,fromType:i,doc:s,lib:a,flowId:c,isValidConnection:l=ca,nodeLookup:u}){let f=i==="target",d=t?s.querySelector(`.${a}-flow__handle[data-id="${c}-${t?.nodeId}-${t?.id}-${t?.type}"]`):null,{x:h,y:p}=we(e),v=s.elementFromPoint(h,p),x=v?.classList.contains(`${a}-flow__handle`)?v:d,m={handleDomNode:x,isValid:!1,connection:null,toHandle:null};if(x){let b=aa(void 0,x),g=x.getAttribute("data-nodeid"),w=x.getAttribute("data-handleid"),C=x.classList.contains("connectable"),E=x.classList.contains("connectableend");if(!g||!b)return m;let M={source:f?g:o,sourceHandle:f?w:r,target:f?o:g,targetHandle:f?r:w};m.connection=M;let P=C&&E&&(n===Le.Strict?f&&b==="source"||!f&&b==="target":g!==o||w!==r);m.isValid=P&&l(M),m.toHandle=sa(g,b,w,u,n,!0)}return m}var so={onPointerDown:Wf,isValid:la};function ua({domNode:e,panZoom:t,getTransform:n,getViewScale:o}){let r=ce(e);function i({translateExtent:a,width:c,height:l,zoomStep:u=1,pannable:f=!0,zoomable:d=!0,inversePan:h=!1}){let p=g=>{if(g.sourceEvent.type!=="wheel"||!t)return;let w=n(),C=g.sourceEvent.ctrlKey&&It()?10:1,E=-g.sourceEvent.deltaY*(g.sourceEvent.deltaMode===1?.05:g.sourceEvent.deltaMode?1:.002)*u,M=w[2]*Math.pow(2,E*C);t.scaleTo(M)},v=[0,0],x=g=>{(g.sourceEvent.type==="mousedown"||g.sourceEvent.type==="touchstart")&&(v=[g.sourceEvent.clientX??g.sourceEvent.touches[0].clientX,g.sourceEvent.clientY??g.sourceEvent.touches[0].clientY])},m=g=>{let w=n();if(g.sourceEvent.type!=="mousemove"&&g.sourceEvent.type!=="touchmove"||!t)return;let C=[g.sourceEvent.clientX??g.sourceEvent.touches[0].clientX,g.sourceEvent.clientY??g.sourceEvent.touches[0].clientY],E=[C[0]-v[0],C[1]-v[1]];v=C;let M=o()*Math.max(w[2],Math.log(w[2]))*(h?-1:1),A={x:w[0]-E[0]*M,y:w[1]-E[1]*M},P=[[0,0],[c,l]];t.setViewportConstrained({x:A.x,y:A.y,zoom:w[2]},P,a)},b=Zn().on("start",x).on("zoom",f?m:null).on("zoom.wheel",d?p:null);r.call(b,{})}function s(){r.on("zoom",null)}return{update:i,destroy:s,pointer:fe}}var ao=e=>({x:e.x,y:e.y,zoom:e.k}),$o=({x:e,y:t,zoom:n})=>ct.translate(e,t).scale(n),We=(e,t)=>e.target.closest(`.${t}`),da=(e,t)=>t===2&&Array.isArray(e)&&e.includes(2),qf=e=>((e*=2)<=1?e*e*e:(e-=2)*e*e+2)/2,Ro=(e,t=0,n=qf,o=()=>{})=>{let r=typeof t=="number"&&t>0;return r||o(),r?e.transition().duration(t).ease(n).on("end",o):e},fa=e=>{let t=e.ctrlKey&&It()?10:1;return-e.deltaY*(e.deltaMode===1?.05:e.deltaMode?1:.002)*t};function Gf({zoomPanValues:e,noWheelClassName:t,d3Selection:n,d3Zoom:o,panOnScrollMode:r,panOnScrollSpeed:i,zoomOnPinch:s,onPanZoomStart:a,onPanZoom:c,onPanZoomEnd:l}){return u=>{if(We(u,t))return u.ctrlKey&&u.preventDefault(),!1;u.preventDefault(),u.stopImmediatePropagation();let f=n.property("__zoom").k||1;if(u.ctrlKey&&s){let x=fe(u),m=fa(u),b=f*Math.pow(2,m);o.scaleTo(n,b,x,u);return}let d=u.deltaMode===1?20:1,h=r===ke.Vertical?0:u.deltaX*d,p=r===ke.Horizontal?0:u.deltaY*d;!It()&&u.shiftKey&&r!==ke.Vertical&&(h=u.deltaY*d,p=0),o.translateBy(n,-(h/f)*i,-(p/f)*i,{internal:!0});let v=ao(n.property("__zoom"));clearTimeout(e.panScrollTimeout),e.isPanScrolling?c?.(u,v):(e.isPanScrolling=!0,a?.(u,v)),e.panScrollTimeout=setTimeout(()=>{l?.(u,v),e.isPanScrolling=!1},150)}}function Kf({noWheelClassName:e,preventScrolling:t,d3ZoomHandler:n}){return function(o,r){let i=o.type==="wheel",s=!t&&i&&!o.ctrlKey,a=We(o,e);if(o.ctrlKey&&i&&a&&o.preventDefault(),s||a)return null;o.preventDefault(),n.call(this,o,r)}}function Uf({zoomPanValues:e,onDraggingChange:t,onPanZoomStart:n}){return o=>{if(o.sourceEvent?.internal)return;let r=ao(o.transform);e.mouseButton=o.sourceEvent?.button||0,e.isZoomingOrPanning=!0,e.prevViewport=r,o.sourceEvent?.type==="mousedown"&&t(!0),n&&n?.(o.sourceEvent,r)}}function Qf({zoomPanValues:e,panOnDrag:t,onPaneContextMenu:n,onTransformChange:o,onPanZoom:r}){return i=>{e.usedRightMouseButton=!!(n&&da(t,e.mouseButton??0)),i.sourceEvent?.sync||o([i.transform.x,i.transform.y,i.transform.k]),r&&!i.sourceEvent?.internal&&r?.(i.sourceEvent,ao(i.transform))}}function Jf({zoomPanValues:e,panOnDrag:t,panOnScroll:n,onDraggingChange:o,onPanZoomEnd:r,onPaneContextMenu:i}){return s=>{if(!s.sourceEvent?.internal&&(e.isZoomingOrPanning=!1,i&&da(t,e.mouseButton??0)&&!e.usedRightMouseButton&&s.sourceEvent&&i(s.sourceEvent),e.usedRightMouseButton=!1,o(!1),r)){let a=ao(s.transform);e.prevViewport=a,clearTimeout(e.timerId),e.timerId=setTimeout(()=>{r?.(s.sourceEvent,a)},n?150:0)}}}function jf({panActivationKeyPressed:e,zoomActivationKeyPressed:t,zoomOnScroll:n,zoomOnPinch:o,panOnDrag:r,panOnScroll:i,zoomOnDoubleClick:s,userSelectionActive:a,noWheelClassName:c,noPanClassName:l,lib:u,connectionInProgress:f}){return d=>{let h=t||n,p=o&&d.ctrlKey,v=d.type==="wheel";if(d.button===1&&d.type==="mousedown"&&(We(d,`${u}-flow__node`)||We(d,`${u}-flow__edge`)||We(d,`${u}-flow__selection`)||We(d,`${u}-flow__nodesselection`)))return!0;if(!r&&!h&&!i&&!s&&!o||a||f&&!v||We(d,c)&&v||We(d,l)&&(!v||i&&v&&!t)||!o&&d.ctrlKey&&v)return!1;if(!o&&d.type==="touchstart"&&d.touches?.length>1)return d.preventDefault(),!1;if(!h&&!i&&!p&&v||!r&&(d.type==="mousedown"||d.type==="touchstart")||Array.isArray(r)&&!r.includes(d.button)&&d.type==="mousedown")return!1;let x=Array.isArray(r)&&r.includes(d.button)||!d.button||d.button<=1;return(!d.ctrlKey||v||e)&&x}}function ha({domNode:e,minZoom:t,maxZoom:n,translateExtent:o,viewport:r,onPanZoom:i,onPanZoomStart:s,onPanZoomEnd:a,onDraggingChange:c}){let l={isZoomingOrPanning:!1,usedRightMouseButton:!1,prevViewport:{},mouseButton:0,timerId:void 0,panScrollTimeout:void 0,isPanScrolling:!1},u=e.getBoundingClientRect(),f=[[0,0],[u.width,u.height]];(typeof ResizeObserver<"u"?new ResizeObserver($=>{let y=$[0];y&&(f=[[0,0],[y.contentRect.width,y.contentRect.height]])}):null)?.observe(e);let h=Zn().extent(()=>f).scaleExtent([t,n]).translateExtent(o),p=ce(e).call(h);w({x:r.x,y:r.y,zoom:Et(r.zoom,t,n)},[[0,0],[u.width,u.height]],o);let v=p.on("wheel.zoom"),x=p.on("dblclick.zoom");h.wheelDelta(fa);async function m($,y){return p?new Promise(S=>{h?.interpolate(y?.interpolate==="linear"?Re:it).transform(Ro(p,y?.duration,y?.ease,()=>S(!0)),$)}):!1}function b({noWheelClassName:$,noPanClassName:y,onPaneContextMenu:S,userSelectionActive:N,panOnScroll:I,panOnDrag:D,panOnScrollMode:O,panOnScrollSpeed:R,preventScrolling:B,zoomOnPinch:L,zoomOnScroll:Z,zoomOnDoubleClick:F,panActivationKeyPressed:G=!1,zoomActivationKeyPressed:j,lib:q,onTransformChange:z,connectionInProgress:X,paneClickDistance:J,selectionOnDrag:Q}){N&&!l.isZoomingOrPanning&&g();let W=I&&!j&&!N;h.clickDistance(Q?1/0:!xe(J)||J<0?0:J);let U=W?Gf({zoomPanValues:l,noWheelClassName:$,d3Selection:p,d3Zoom:h,panOnScrollMode:O,panOnScrollSpeed:R,zoomOnPinch:L,onPanZoomStart:s,onPanZoom:i,onPanZoomEnd:a}):Kf({noWheelClassName:$,preventScrolling:B,d3ZoomHandler:v});p.on("wheel.zoom",U,{passive:!1});let ee=Uf({zoomPanValues:l,onDraggingChange:c,onPanZoomStart:s});h.on("start",ee);let te=Qf({zoomPanValues:l,panOnDrag:D,onPaneContextMenu:!!S,onPanZoom:i,onTransformChange:z});h.on("zoom",te);let re=Jf({zoomPanValues:l,panOnDrag:D,panOnScroll:I,onPaneContextMenu:S,onPanZoomEnd:a,onDraggingChange:c});h.on("end",re);let le=jf({panActivationKeyPressed:G,zoomActivationKeyPressed:j,panOnDrag:D,zoomOnScroll:Z,panOnScroll:I,zoomOnDoubleClick:F,zoomOnPinch:L,userSelectionActive:N,noPanClassName:y,noWheelClassName:$,lib:q,connectionInProgress:X});h.filter(le),F?p.on("dblclick.zoom",x):p.on("dblclick.zoom",null)}function g(){h.on("zoom",null)}async function w($,y,S){let N=$o($),I=h?.constrain()(N,y,S);return I&&await m(I),I}async function C($,y){let S=$o($);return await m(S,y),S}function E($){if(p){let y=$o($),S=p.property("__zoom");(S.k!==$.zoom||S.x!==$.x||S.y!==$.y)&&h?.transform(p,y,null,{sync:!0})}}function M(){let $=p?nn(p.node()):{x:0,y:0,k:1};return{x:$.x,y:$.y,zoom:$.k}}async function A($,y){return p?new Promise(S=>{h?.interpolate(y?.interpolate==="linear"?Re:it).scaleTo(Ro(p,y?.duration,y?.ease,()=>S(!0)),$)}):!1}async function P($,y){return p?new Promise(S=>{h?.interpolate(y?.interpolate==="linear"?Re:it).scaleBy(Ro(p,y?.duration,y?.ease,()=>S(!0)),$)}):!1}function V($){h?.scaleExtent($)}function T($){h?.translateExtent($)}function H($){let y=!xe($)||$<0?0:$;h?.clickDistance(y)}return{update:b,destroy:g,setViewport:C,setViewportConstrained:w,getViewport:M,scaleTo:A,scaleBy:P,setScaleExtent:V,setTranslateExtent:T,syncViewport:E,setClickDistance:H}}var Pe;(function(e){e.Line="line",e.Handle="handle"})(Pe||(Pe={}));var pa=["top-left","top-right","bottom-left","bottom-right"],ga=["top","right","bottom","left"];function eh({width:e,prevWidth:t,height:n,prevHeight:o,affectsX:r,affectsY:i}){let s=e-t,a=n-o,c=[s>0?1:s<0?-1:0,a>0?1:a<0?-1:0];return s&&r&&(c[0]=c[0]*-1),a&&i&&(c[1]=c[1]*-1),c}function Ds(e){let t=e.includes("right")||e.includes("left"),n=e.includes("bottom")||e.includes("top"),o=e.includes("left"),r=e.includes("top");return{isHorizontal:t,isVertical:n,affectsX:o,affectsY:r}}function Ye(e,t){return Math.max(0,t-e)}function Ze(e,t){return Math.max(0,e-t)}function qn(e,t,n){return Math.max(0,t-e,e-n)}function Os(e,t){return e?!t:t}function th(e,t,n,o,r,i,s,a){let{affectsX:c,affectsY:l}=t,{isHorizontal:u,isVertical:f}=t,d=u&&f,{xSnapped:h,ySnapped:p}=n,{minWidth:v,maxWidth:x,minHeight:m,maxHeight:b}=o,{x:g,y:w,width:C,height:E,aspectRatio:M}=e,A=Math.floor(u?h-e.pointerX:0),P=Math.floor(f?p-e.pointerY:0),V=C+(c?-A:A),T=E+(l?-P:P),H=-i[0]*C,$=-i[1]*E,y=qn(V,v,x),S=qn(T,m,b);if(s){let D=0,O=0;c&&A<0?D=Ye(g+A+H,s[0][0]):!c&&A>0&&(D=Ze(g+V+H,s[1][0])),l&&P<0?O=Ye(w+P+$,s[0][1]):!l&&P>0&&(O=Ze(w+T+$,s[1][1])),y=Math.max(y,D),S=Math.max(S,O)}if(a){let D=0,O=0;c&&A>0?D=Ze(g+A,a[0][0]):!c&&A<0&&(D=Ye(g+V,a[1][0])),l&&P>0?O=Ze(w+P,a[0][1]):!l&&P<0&&(O=Ye(w+T,a[1][1])),y=Math.max(y,D),S=Math.max(S,O)}if(r){if(u){let D=qn(V/M,m,b)*M;if(y=Math.max(y,D),s){let O=0;!c&&!l||c&&!l&&d?O=Ze(w+$+V/M,s[1][1])*M:O=Ye(w+$+(c?A:-A)/M,s[0][1])*M,y=Math.max(y,O)}if(a){let O=0;!c&&!l||c&&!l&&d?O=Ye(w+V/M,a[1][1])*M:O=Ze(w+(c?A:-A)/M,a[0][1])*M,y=Math.max(y,O)}}if(f){let D=qn(T*M,v,x)/M;if(S=Math.max(S,D),s){let O=0;!c&&!l||l&&!c&&d?O=Ze(g+T*M+H,s[1][0])/M:O=Ye(g+(l?P:-P)*M+H,s[0][0])/M,S=Math.max(S,O)}if(a){let O=0;!c&&!l||l&&!c&&d?O=Ye(g+T*M,a[1][0])/M:O=Ze(g+(l?P:-P)*M,a[0][0])/M,S=Math.max(S,O)}}}P=P+(P<0?S:-S),A=A+(A<0?y:-y),r&&(d?V>T*M?P=(Os(c,l)?-A:A)/M:A=(Os(c,l)?-P:P)*M:u?(P=A/M,l=c):(A=P*M,c=l));let N=c?g+A:g,I=l?w+P:w;return{width:C+(c?-A:A),height:E+(l?-P:P),x:i[0]*A*(c?-1:1)+N,y:i[1]*P*(l?-1:1)+I}}var ma={width:0,height:0,x:0,y:0},nh={...ma,pointerX:0,pointerY:0,aspectRatio:1};function oh(e,t,n){let o=t.position.x+e.position.x,r=t.position.y+e.position.y,i=e.measured.width??0,s=e.measured.height??0,a=n[0]*i,c=n[1]*s;return[[o-a,r-c],[o+i-a,r+s-c]]}function ya({domNode:e,nodeId:t,getStoreItems:n,onChange:o,onEnd:r}){let i=ce(e),s={controlDirection:Ds("bottom-right"),boundaries:{minWidth:0,minHeight:0,maxWidth:Number.MAX_VALUE,maxHeight:Number.MAX_VALUE},resizeDirection:void 0,keepAspectRatio:!1};function a({controlPosition:l,boundaries:u,keepAspectRatio:f,resizeDirection:d,onResizeStart:h,onResize:p,onResizeEnd:v,shouldResize:x}){let m={...ma},b={...nh};s={boundaries:u,resizeDirection:d,keepAspectRatio:f,controlDirection:Ds(l)};let g,w=null,C=[],E,M,A,P=!1,V=_n().on("start",T=>{let{nodeLookup:H,transform:$,snapGrid:y,snapToGrid:S,nodeOrigin:N,paneDomNode:I}=n();if(g=H.get(t),!g)return;w=I?.getBoundingClientRect()??null;let{xSnapped:D,ySnapped:O}=on(T.sourceEvent,{transform:$,snapGrid:y,snapToGrid:S,containerBounds:w});m={width:g.measured.width??0,height:g.measured.height??0,x:g.position.x??0,y:g.position.y??0},b={...m,pointerX:D,pointerY:O,aspectRatio:m.width/m.height},E=void 0,M=ft(g.extent)?g.extent:void 0,g.parentId&&(g.extent==="parent"||g.expandParent)&&(E=H.get(g.parentId)),E&&g.extent==="parent"&&(M=[[0,0],[E.measured.width,E.measured.height]]),C=[],A=void 0;for(let[R,B]of H)if(B.parentId===t&&(C.push({id:R,position:{...B.position},extent:B.extent}),B.extent==="parent"||B.expandParent)){let L=oh(B,g,B.origin??N);A?A=[[Math.min(L[0][0],A[0][0]),Math.min(L[0][1],A[0][1])],[Math.max(L[1][0],A[1][0]),Math.max(L[1][1],A[1][1])]]:A=L}h?.(T,{...m})}).on("drag",T=>{let{transform:H,snapGrid:$,snapToGrid:y,nodeOrigin:S}=n(),N=on(T.sourceEvent,{transform:H,snapGrid:$,snapToGrid:y,containerBounds:w}),I=[];if(!g)return;let{x:D,y:O,width:R,height:B}=m,L={},Z=g.origin??S,{width:F,height:G,x:j,y:q}=th(b,s.controlDirection,N,s.boundaries,s.keepAspectRatio,Z,M,A),z=F!==R,X=G!==B,J=j!==D&&z,Q=q!==O&&X;if(!J&&!Q&&!z&&!X)return;if((J||Q||Z[0]===1||Z[1]===1)&&(L.x=J?j:m.x,L.y=Q?q:m.y,m.x=L.x,m.y=L.y,C.length>0)){let te=j-D,re=q-O;for(let le of C)le.position={x:le.position.x-te+Z[0]*(F-R),y:le.position.y-re+Z[1]*(G-B)},I.push(le)}if((z||X)&&(L.width=z&&(!s.resizeDirection||s.resizeDirection==="horizontal")?F:m.width,L.height=X&&(!s.resizeDirection||s.resizeDirection==="vertical")?G:m.height,m.width=L.width,m.height=L.height),E&&g.expandParent){let te=Z[0]*(L.width??0);L.x&&L.x<te&&(m.x=te,b.x=b.x-(L.x-te));let re=Z[1]*(L.height??0);L.y&&L.y<re&&(m.y=re,b.y=b.y-(L.y-re))}let W=eh({width:m.width,prevWidth:R,height:m.height,prevHeight:B,affectsX:s.controlDirection.affectsX,affectsY:s.controlDirection.affectsY}),U={...m,direction:W};x?.(T,U)!==!1&&(P=!0,p?.(T,U),o(L,I))}).on("end",T=>{P&&(v?.(T,{...m}),r?.({...m}),P=!1)});i.call(V)}function c(){i.on(".drag",null)}return{update:a,destroy:c}}var Pa=vo(require("react"),1),Aa=vo(Ca(),1);var Ma={},Na=e=>{let t,n=new Set,o=(u,f)=>{let d=typeof u=="function"?u(t):u;if(!Object.is(d,t)){let h=t;t=f??(typeof d!="object"||d===null)?d:Object.assign({},t,d),n.forEach(p=>p(t,h))}},r=()=>t,c={setState:o,getState:r,getInitialState:()=>l,subscribe:u=>(n.add(u),()=>n.delete(u)),destroy:()=>{(Ma.env?Ma.env.MODE:void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),n.clear()}},l=t=e(o,r,c);return c},Ia=e=>e?Na(e):Na;var{useDebugValue:bh}=Pa.default,{useSyncExternalStoreWithSelector:Eh}=Aa.default,Sh=e=>e;function cr(e,t=Sh,n){let o=Eh(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,n);return bh(o),o}var ka=(e,t)=>{let n=Ia(e),o=(r,i=t)=>cr(n,r,i);return Object.assign(o,n),o},Da=(e,t)=>e?ka(e,t):ka;function oe(e,t){if(Object.is(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;if(e instanceof Map&&t instanceof Map){if(e.size!==t.size)return!1;for(let[o,r]of e)if(!Object.is(r,t.get(o)))return!1;return!0}if(e instanceof Set&&t instanceof Set){if(e.size!==t.size)return!1;for(let o of e)if(!t.has(o))return!1;return!0}let n=Object.keys(e);if(n.length!==Object.keys(t).length)return!1;for(let o of n)if(!Object.prototype.hasOwnProperty.call(t,o)||!Object.is(e[o],t[o]))return!1;return!0}var ho=vo(Ha()),po=(0,_.createContext)(null),Ih=po.Provider,uc=ge.error001("react");function K(e,t){let n=(0,_.useContext)(po);if(n===null)throw new Error(uc);return cr(n,e,t)}function ne(){let e=(0,_.useContext)(po);if(e===null)throw new Error(uc);return(0,_.useMemo)(()=>({getState:e.getState,setState:e.setState,subscribe:e.subscribe}),[e])}var La={display:"none"},kh={position:"absolute",width:1,height:1,margin:-1,border:0,padding:0,overflow:"hidden",clip:"rect(0px, 0px, 0px, 0px)",clipPath:"inset(100%)"},dc="react-flow__node-desc",fc="react-flow__edge-desc",Ph="react-flow__aria-live",Ah=e=>e.ariaLiveMessage,Dh=e=>e.ariaLabelConfig;function Oh({rfId:e}){let t=K(Ah);return(0,k.jsx)("div",{id:`${Ph}-${e}`,"aria-live":"assertive","aria-atomic":"true",style:kh,children:t})}function Th({rfId:e,disableKeyboardA11y:t}){let n=K(Dh);return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)("div",{id:`${dc}-${e}`,style:La,children:t?n["node.a11yDescription.default"]:n["node.a11yDescription.keyboardDisabled"]}),(0,k.jsx)("div",{id:`${fc}-${e}`,style:La,children:n["edge.a11yDescription.default"]}),!t&&(0,k.jsx)(Oh,{rfId:e})]})}var pn=(0,_.forwardRef)(({position:e="top-left",children:t,className:n,style:o,...r},i)=>{let s=`${e}`.split("-");return(0,k.jsx)("div",{className:ie(["react-flow__panel",n,...s]),style:o,ref:i,...r,children:t})});pn.displayName="Panel";var Ba="https://reactflow.dev?utm_source=attribution";function zh({proOptions:e,position:t="bottom-right"}){return(0,_.useEffect)(()=>{},[]),e?.hideAttribution?null:(0,k.jsx)(pn,{position:t,className:"react-flow__attribution","data-message":`Please only hide this attribution when you are subscribed to React Flow Pro: ${Ba}`,children:(0,k.jsx)("a",{href:Ba,target:"_blank",rel:"noopener noreferrer","aria-label":"React Flow attribution",children:"React Flow"})})}var $h=e=>{let t=[],n=[];for(let[,o]of e.nodeLookup)o.selected&&t.push(o.internals.userNode);for(let[,o]of e.edgeLookup)o.selected&&n.push(o);return{selectedNodes:t,selectedEdges:n}},uo=e=>e.id;function Rh(e,t){return oe(e.selectedNodes.map(uo),t.selectedNodes.map(uo))&&oe(e.selectedEdges.map(uo),t.selectedEdges.map(uo))}function Hh({onSelectionChange:e}){let t=ne(),{selectedNodes:n,selectedEdges:o}=K($h,Rh);return(0,_.useEffect)(()=>{let r={nodes:n,edges:o};e?.(r),t.getState().onSelectionChangeHandlers.forEach(i=>i(r))},[n,o,e]),null}var Lh=e=>!!e.onSelectionChangeHandlers;function Bh({onSelectionChange:e}){let t=K(Lh);return e||t?(0,k.jsx)(Hh,{onSelectionChange:e}):null}var hc=[0,0],Vh={x:0,y:0,zoom:1},Fh=["nodes","edges","defaultNodes","defaultEdges","onConnect","onConnectStart","onConnectEnd","onClickConnectStart","onClickConnectEnd","nodesDraggable","autoPanOnNodeFocus","nodesConnectable","nodesFocusable","edgesFocusable","edgesReconnectable","elevateNodesOnSelect","elevateEdgesOnSelect","minZoom","maxZoom","nodeExtent","onNodesChange","onEdgesChange","elementsSelectable","connectionMode","snapGrid","snapToGrid","translateExtent","connectOnClick","defaultEdgeOptions","fitView","fitViewOptions","onNodesDelete","onEdgesDelete","onDelete","onNodeDrag","onNodeDragStart","onNodeDragStop","onSelectionDrag","onSelectionDragStart","onSelectionDragStop","onMoveStart","onMove","onMoveEnd","noPanClassName","nodeOrigin","autoPanOnConnect","autoPanOnNodeDrag","onError","connectionRadius","isValidConnection","selectNodesOnDrag","nodeDragThreshold","connectionDragThreshold","onBeforeDelete","debug","autoPanSpeed","ariaLabelConfig","zIndexMode"],Va=[...Fh,"rfId"],Xh=e=>({setNodes:e.setNodes,setEdges:e.setEdges,setMinZoom:e.setMinZoom,setMaxZoom:e.setMaxZoom,setTranslateExtent:e.setTranslateExtent,setNodeExtent:e.setNodeExtent,reset:e.reset,setDefaultNodesAndEdges:e.setDefaultNodesAndEdges}),Fa={translateExtent:St,nodeOrigin:hc,minZoom:.5,maxZoom:2,elementsSelectable:!0,noPanClassName:"nopan",rfId:"1"};function Yh(e){let{setNodes:t,setEdges:n,setMinZoom:o,setMaxZoom:r,setTranslateExtent:i,setNodeExtent:s,reset:a,setDefaultNodesAndEdges:c}=K(Xh,oe),l=ne();(0,_.useEffect)(()=>(c(e.defaultNodes,e.defaultEdges),()=>{u.current=Fa,a()}),[]);let u=(0,_.useRef)(Fa);return(0,_.useEffect)(()=>{for(let f of Va){let d=e[f],h=u.current[f];d!==h&&(typeof e[f]>"u"||(f==="nodes"?t(d):f==="edges"?n(d):f==="minZoom"?o(d):f==="maxZoom"?r(d):f==="translateExtent"?i(d):f==="nodeExtent"?s(d):f==="ariaLabelConfig"?l.setState({ariaLabelConfig:Fs(d)}):f==="fitView"?l.setState({fitViewQueued:d}):f==="fitViewOptions"?l.setState({fitViewOptions:d}):l.setState({[f]:d})))}u.current=e},Va.map(f=>e[f])),null}function Xa(){return typeof window>"u"||!window.matchMedia?null:window.matchMedia("(prefers-color-scheme: dark)")}function Zh(e){let[t,n]=(0,_.useState)(e==="system"?null:e);return(0,_.useEffect)(()=>{if(e!=="system"){n(e);return}let o=Xa(),r=()=>n(o?.matches?"dark":"light");return r(),o?.addEventListener("change",r),()=>{o?.removeEventListener("change",r)}},[e]),t!==null?t:Xa()?.matches?"dark":"light"}var Ya=typeof document<"u"?document:null;function Dt(e=null,t={target:Ya,actInsideInputWithModifier:!0}){let[n,o]=(0,_.useState)(!1),r=(0,_.useRef)(!1),i=(0,_.useRef)(new Set([])),[s,a]=(0,_.useMemo)(()=>{if(e!==null){let l=(Array.isArray(e)?e:[e]).filter(f=>typeof f=="string").map(f=>f.replace(/\+/g,`
`).replace(`

`,`
+`).split(`
`)),u=l.reduce((f,d)=>f.concat(...d),[]);return[l,u]}return[[],[]]},[e]);return(0,_.useEffect)(()=>{let c=t?.target??Ya,l=t?.actInsideInputWithModifier??!0;if(e!==null){let u=h=>{if(r.current=h.ctrlKey||h.metaKey||h.shiftKey||h.altKey,(!r.current||r.current&&!l)&&er(h))return!1;let v=Wa(h.code,a);if(i.current.add(h[v]),Za(s,i.current,!1)){let x=h.composedPath?.()?.[0]||h.target,m=x?.nodeName==="BUTTON"||x?.nodeName==="A";t.preventDefault!==!1&&(r.current||!m)&&h.preventDefault(),o(!0)}},f=h=>{let p=Wa(h.code,a);Za(s,i.current,!0)?(o(!1),i.current.clear()):i.current.delete(h[p]),h.key==="Meta"&&i.current.clear(),r.current=!1},d=()=>{i.current.clear(),o(!1)};return c?.addEventListener("keydown",u),c?.addEventListener("keyup",f),window.addEventListener("blur",d),window.addEventListener("contextmenu",d),()=>{c?.removeEventListener("keydown",u),c?.removeEventListener("keyup",f),window.removeEventListener("blur",d),window.removeEventListener("contextmenu",d)}}},[e,o]),n}function Za(e,t,n){return e.filter(o=>n||o.length===t.size).some(o=>o.every(r=>t.has(r)))}function Wa(e,t){return t.includes(e)?"code":"key"}var Wh=()=>{let e=ne();return(0,_.useMemo)(()=>({zoomIn:async t=>{let{panZoom:n}=e.getState();return n?n.scaleBy(1.2,t):!1},zoomOut:async t=>{let{panZoom:n}=e.getState();return n?n.scaleBy(1/1.2,t):!1},zoomTo:async(t,n)=>{let{panZoom:o}=e.getState();return o?o.scaleTo(t,n):!1},getZoom:()=>e.getState().transform[2],setViewport:async(t,n)=>{let{transform:[o,r,i],panZoom:s}=e.getState();return s?(await s.setViewport({x:t.x??o,y:t.y??r,zoom:t.zoom??i},n),!0):!1},getViewport:()=>{let[t,n,o]=e.getState().transform;return{x:t,y:n,zoom:o}},setCenter:async(t,n,o)=>e.getState().setCenter(t,n,o),fitBounds:async(t,n)=>{let{width:o,height:r,minZoom:i,maxZoom:s,panZoom:a}=e.getState(),c=Mt(t,o,r,i,s,n?.padding??.1);return a?(await a.setViewport(c,{duration:n?.duration,ease:n?.ease,interpolate:n?.interpolate}),!0):!1},screenToFlowPosition:(t,n={})=>{let{transform:o,snapGrid:r,snapToGrid:i,domNode:s}=e.getState();if(!s)return t;let{x:a,y:c}=s.getBoundingClientRect(),l={x:t.x-a,y:t.y-c},u=n.snapGrid??r,f=n.snapToGrid??i;return Nt(l,o,f,u)},flowToScreenPosition:t=>{let{transform:n,domNode:o}=e.getState();if(!o)return t;let{x:r,y:i}=o.getBoundingClientRect(),s=dt(t,n);return{x:s.x+r,y:s.y+i}}}),[])};function pc(e,t){let n=[],o=new Map,r=[];for(let i of e)if(i.type==="add"){r.push(i);continue}else if(i.type==="remove"||i.type==="replace")o.set(i.id,[i]);else{let s=o.get(i.id);s?s.push(i):o.set(i.id,[i])}for(let i of t){let s=o.get(i.id);if(!s){n.push(i);continue}if(s[0].type==="remove")continue;if(s[0].type==="replace"){n.push({...s[0].item});continue}let a={...i};for(let c of s)qh(c,a);n.push(a)}return r.length&&r.forEach(i=>{i.index!==void 0?n.splice(i.index,0,{...i.item}):n.push({...i.item})}),n}function qh(e,t){switch(e.type){case"select":{t.selected=e.selected;break}case"position":{typeof e.position<"u"&&(t.position=e.position),typeof e.dragging<"u"&&(t.dragging=e.dragging);break}case"dimensions":{typeof e.dimensions<"u"&&(t.measured={...e.dimensions},e.setAttributes&&((e.setAttributes===!0||e.setAttributes==="width")&&(t.width=e.dimensions.width),(e.setAttributes===!0||e.setAttributes==="height")&&(t.height=e.dimensions.height))),typeof e.resizing=="boolean"&&(t.resizing=e.resizing);break}}}function pr(e,t){return pc(e,t)}function gr(e,t){return pc(e,t)}function pt(e,t){return{id:e,type:"select",selected:t}}function At(e,t=new Set,n=!1){let o=[];for(let[r,i]of e){let s=t.has(r);!(i.selected===void 0&&!s)&&i.selected!==s&&(n&&(i.selected=s),o.push(pt(i.id,s)))}return o}function qa({items:e=[],lookup:t}){let n=[],o=new Map(e.map(r=>[r.id,r]));for(let[r,i]of e.entries()){let s=t.get(i.id),a=s?.internals?.userNode??s;a!==void 0&&a!==i&&n.push({id:i.id,item:i,type:"replace"}),a===void 0&&n.push({item:i,type:"add",index:r})}for(let[r]of t)o.get(r)===void 0&&n.push({id:r,type:"remove"});return n}function Ga(e){return{id:e.id,type:"remove"}}var gc=Go("React Flow","https://reactflow.dev/");function mc(e,t,n={}){return Ws(e,t,{...n,onError:n.onError??gc})}function Gh(e,t,n,o={shouldReplaceId:!0}){return qs(e,t,n,{...o,onError:o.onError??gc})}var dr=e=>Ts(e),yc=e=>Fo(e);function xc(e){return(0,_.forwardRef)(e)}var wc=typeof window<"u"?_.useLayoutEffect:_.useEffect;function Ka(e){let[t,n]=(0,_.useState)(BigInt(0)),[o]=(0,_.useState)(()=>Kh(()=>n(r=>r+BigInt(1))));return wc(()=>{let r=o.get();r.length&&(e(r),o.reset())},[t]),o}function Kh(e){let t=[];return{get:()=>t,reset:()=>{t=[]},push:n=>{t.push(n),e()}}}var vc=(0,_.createContext)(null);function Uh({children:e}){let t=ne(),n=(0,_.useCallback)(a=>{let{nodes:c=[],setNodes:l,hasDefaultNodes:u,onNodesChange:f,nodeLookup:d,fitViewQueued:h,onNodesChangeMiddlewareMap:p}=t.getState(),v=c;for(let m of a)v=typeof m=="function"?m(v):m;let x=qa({items:v,lookup:d});for(let m of p.values())x=m(x);u&&l(v),x.length>0?f?.(x):h&&window.requestAnimationFrame(()=>{let{fitViewQueued:m,nodes:b,setNodes:g}=t.getState();m&&g(b)})},[]),o=Ka(n),r=(0,_.useCallback)(a=>{let{edges:c=[],setEdges:l,hasDefaultEdges:u,onEdgesChange:f,edgeLookup:d}=t.getState(),h=c;for(let p of a)h=typeof p=="function"?p(h):p;u?l(h):f&&f(qa({items:h,lookup:d}))},[]),i=Ka(r),s=(0,_.useMemo)(()=>({nodeQueue:o,edgeQueue:i}),[]);return(0,k.jsx)(vc.Provider,{value:s,children:e})}function Qh(){let e=(0,_.useContext)(vc);if(!e)throw new Error("useBatchContext must be used within a BatchProvider");return e}var Jh=e=>!!e.panZoom;function go(){let e=Wh(),t=ne(),n=Qh(),o=K(Jh),r=(0,_.useMemo)(()=>{let i=f=>t.getState().nodeLookup.get(f),s=f=>{n.nodeQueue.push(f)},a=f=>{n.edgeQueue.push(f)},c=f=>{let{nodeLookup:d,nodeOrigin:h}=t.getState(),p=dr(f)?f:d.get(f.id),v=p.parentId?Ko(p.position,p.measured,p.parentId,d,h):p.position,x={...p,position:v,width:p.measured?.width??p.width,height:p.measured?.height??p.height};return _t(x)},l=(f,d,h={replace:!1})=>{s(p=>p.map(v=>{if(v.id===f){let x=typeof d=="function"?d(v):d;return h.replace&&dr(x)?x:{...v,...x}}return v}))},u=(f,d,h={replace:!1})=>{a(p=>p.map(v=>{if(v.id===f){let x=typeof d=="function"?d(v):d;return h.replace&&yc(x)?x:{...v,...x}}return v}))};return{getNodes:()=>t.getState().nodes.map(f=>({...f})),getNode:f=>i(f)?.internals.userNode,getInternalNode:i,getEdges:()=>{let{edges:f=[]}=t.getState();return f.map(d=>({...d}))},getEdge:f=>t.getState().edgeLookup.get(f),setNodes:s,setEdges:a,addNodes:f=>{let d=Array.isArray(f)?f:[f];n.nodeQueue.push(h=>[...h,...d])},addEdges:f=>{let d=Array.isArray(f)?f:[f];n.edgeQueue.push(h=>[...h,...d])},toObject:()=>{let{nodes:f=[],edges:d=[],transform:h}=t.getState(),[p,v,x]=h;return{nodes:f.map(m=>({...m})),edges:d.map(m=>({...m})),viewport:{x:p,y:v,zoom:x}}},deleteElements:async({nodes:f=[],edges:d=[]})=>{let{nodes:h,edges:p,onNodesDelete:v,onEdgesDelete:x,triggerNodeChanges:m,triggerEdgeChanges:b,onDelete:g,onBeforeDelete:w}=t.getState(),{nodes:C,edges:E}=await Hs({nodesToRemove:f,edgesToRemove:d,nodes:h,edges:p,onBeforeDelete:w}),M=E.length>0,A=C.length>0;if(M){let P=E.map(Ga);x?.(E),b(P)}if(A){let P=C.map(Ga);v?.(C),m(P)}return(A||M)&&g?.({nodes:C,edges:E}),{deletedNodes:C,deletedEdges:E}},getIntersectingNodes:(f,d=!0,h)=>{let p=qo(f),v=p?f:c(f),x=h!==void 0;return v?(h||t.getState().nodes).filter(m=>{let b=t.getState().nodeLookup.get(m.id);if(b&&!p&&(m.id===f.id||!b.internals.positionAbsolute))return!1;let g=_t(x?m:b),w=sn(g,v);return d&&w>0||w>=g.width*g.height||w>=v.width*v.height}):[]},isNodeIntersecting:(f,d,h=!0)=>{let v=qo(f)?f:c(f);if(!v)return!1;let x=sn(v,d);return h&&x>0||x>=d.width*d.height||x>=v.width*v.height},updateNode:l,updateNodeData:(f,d,h={replace:!1})=>{l(f,p=>{let v=typeof d=="function"?d(p):d;return h.replace?{...p,data:v}:{...p,data:{...p.data,...v}}},h)},updateEdge:u,updateEdgeData:(f,d,h={replace:!1})=>{u(f,p=>{let v=typeof d=="function"?d(p):d;return h.replace?{...p,data:v}:{...p,data:{...p.data,...v}}},h)},getNodesBounds:f=>{let{nodeLookup:d,nodeOrigin:h}=t.getState();return Kn(f,{nodeLookup:d,nodeOrigin:h})},getHandleConnections:({type:f,id:d,nodeId:h})=>Array.from(t.getState().connectionLookup.get(`${h}-${f}${d?`-${d}`:""}`)?.values()??[]),getNodeConnections:({type:f,handleId:d,nodeId:h})=>Array.from(t.getState().connectionLookup.get(`${h}${f?d?`-${f}-${d}`:`-${f}`:""}`)?.values()??[]),fitView:async f=>{let d=t.getState().fitViewResolver??Vs();return t.setState({fitViewQueued:!0,fitViewOptions:f,fitViewResolver:d}),n.nodeQueue.push(h=>[...h]),d.promise}}},[]);return(0,_.useMemo)(()=>({...r,...e,viewportInitialized:o}),[o])}var Ua=e=>e.selected,jh=typeof window<"u"?window:void 0;function ep({deleteKeyCode:e,multiSelectionKeyCode:t}){let n=ne(),{deleteElements:o}=go(),r=Dt(e,{actInsideInputWithModifier:!1}),i=Dt(t,{target:jh});(0,_.useEffect)(()=>{if(r){let{edges:s,nodes:a}=n.getState();o({nodes:a.filter(Ua),edges:s.filter(Ua)}),n.setState({nodesSelectionActive:!1})}},[r]),(0,_.useEffect)(()=>{n.setState({multiSelectionActive:i})},[i])}function tp(e){let t=ne();(0,_.useEffect)(()=>{let n=()=>{if(!e.current||!(e.current.checkVisibility?.()??!0))return!1;let o=to(e.current);(o.height===0||o.width===0)&&t.getState().onError?.("004",ge.error004()),t.setState({width:o.width||500,height:o.height||500})};if(e.current){n(),window.addEventListener("resize",n);let o=new ResizeObserver(()=>n());return o.observe(e.current),()=>{window.removeEventListener("resize",n),o&&e.current&&o.unobserve(e.current)}}},[])}var mo={position:"absolute",width:"100%",height:"100%",top:0,left:0},np=e=>({userSelectionActive:e.userSelectionActive,lib:e.lib,connectionInProgress:e.connection.inProgress});function op({onPaneContextMenu:e,zoomOnScroll:t=!0,zoomOnPinch:n=!0,panOnScroll:o=!1,panActivationKeyPressed:r,panOnScrollSpeed:i=.5,panOnScrollMode:s=ke.Free,zoomOnDoubleClick:a=!0,panOnDrag:c=!0,defaultViewport:l,translateExtent:u,minZoom:f,maxZoom:d,zoomActivationKeyCode:h,preventScrolling:p=!0,children:v,noWheelClassName:x,noPanClassName:m,onViewportChange:b,isControlledViewport:g,paneClickDistance:w,selectionOnDrag:C}){let E=ne(),M=(0,_.useRef)(null),{userSelectionActive:A,lib:P,connectionInProgress:V}=K(np,oe),T=Dt(h),H=(0,_.useRef)();tp(M);let $=(0,_.useCallback)(y=>{b?.({x:y[0],y:y[1],zoom:y[2]}),g||E.setState({transform:y})},[b,g]);return(0,_.useEffect)(()=>{if(M.current){H.current=ha({domNode:M.current,minZoom:f,maxZoom:d,translateExtent:u,viewport:l,onDraggingChange:I=>E.setState(D=>D.paneDragging===I?D:{paneDragging:I}),onPanZoomStart:(I,D)=>{let{onViewportChangeStart:O,onMoveStart:R}=E.getState();R?.(I,D),O?.(D)},onPanZoom:(I,D)=>{let{onViewportChange:O,onMove:R}=E.getState();R?.(I,D),O?.(D)},onPanZoomEnd:(I,D)=>{let{onViewportChangeEnd:O,onMoveEnd:R}=E.getState();R?.(I,D),O?.(D)}});let{x:y,y:S,zoom:N}=H.current.getViewport();return E.setState({panZoom:H.current,transform:[y,S,N],domNode:M.current.closest(".react-flow")}),()=>{H.current?.destroy()}}},[]),(0,_.useEffect)(()=>{H.current?.update({onPaneContextMenu:e,zoomOnScroll:t,zoomOnPinch:n,panOnScroll:o,panActivationKeyPressed:r,panOnScrollSpeed:i,panOnScrollMode:s,zoomOnDoubleClick:a,panOnDrag:c,zoomActivationKeyPressed:T,preventScrolling:p,noPanClassName:m,userSelectionActive:A,noWheelClassName:x,lib:P,onTransformChange:$,connectionInProgress:V,selectionOnDrag:C,paneClickDistance:w})},[e,t,n,o,r,i,s,a,c,T,p,m,A,x,P,$,V,C,w]),(0,k.jsx)("div",{className:"react-flow__renderer",ref:M,style:mo,children:v})}var rp=e=>({userSelectionActive:e.userSelectionActive,userSelectionRect:e.userSelectionRect});function ip(){let{userSelectionActive:e,userSelectionRect:t}=K(rp,oe);return e&&t?(0,k.jsx)("div",{className:"react-flow__selection react-flow__container",style:{width:t.width,height:t.height,transform:`translate(${t.x}px, ${t.y}px)`}}):null}var lr=(e,t)=>n=>{n.target===t.current&&e?.(n)},sp=e=>({userSelectionActive:e.userSelectionActive,elementsSelectable:e.elementsSelectable,dragging:e.paneDragging,panBy:e.panBy,autoPanSpeed:e.autoPanSpeed});function ap({isSelecting:e,selectionKeyPressed:t,selectionMode:n=qe.Full,panOnDrag:o,autoPanOnSelection:r,paneClickDistance:i,selectionOnDrag:s,onSelectionStart:a,onSelectionEnd:c,onPaneClick:l,onPaneContextMenu:u,onPaneScroll:f,onPaneMouseEnter:d,onPaneMouseMove:h,onPaneMouseLeave:p,children:v}){let x=(0,_.useRef)(0),m=ne(),{userSelectionActive:b,elementsSelectable:g,dragging:w,panBy:C,autoPanSpeed:E}=K(sp,oe),M=g&&(e||b),A=(0,_.useRef)(null),P=(0,_.useRef)(),V=(0,_.useRef)(new Set),T=(0,_.useRef)(new Set),H=(0,_.useRef)(!1),$=(0,_.useRef)(!1),y=(0,_.useRef)({x:0,y:0}),S=(0,_.useRef)(!1),N=z=>{if($.current||H.current||m.getState().connection.inProgress){$.current=!1,H.current=!1;return}l?.(z),m.getState().resetSelectedElements(),m.setState({nodesSelectionActive:!1})},I=z=>{if(Array.isArray(o)&&o?.includes(2)){z.preventDefault();return}u?.(z)},D=f?z=>f(z):void 0,O=z=>{$.current&&(z.stopPropagation(),$.current=!1)},R=z=>{if(z.pointerType==="touch"&&o!==!1&&!t)return;let{domNode:X,transform:J}=m.getState();if(P.current=X?.getBoundingClientRect(),!P.current)return;let Q=z.target===A.current;if(!Q&&!!z.target.closest(".nokey")||!e||!(s&&Q||t)||z.button!==0||!z.isPrimary)return;z.target?.setPointerCapture?.(z.pointerId),$.current=!1;let{x:ee,y:te}=we(z.nativeEvent,P.current),re=Nt({x:ee,y:te},J);m.setState({userSelectionRect:{width:0,height:0,startX:re.x,startY:re.y,x:ee,y:te}}),Q||(z.stopPropagation(),z.preventDefault())};function B(z,X){let{userSelectionRect:J}=m.getState();if(!J)return;let{transform:Q,nodeLookup:W,edgeLookup:U,connectionLookup:ee,triggerNodeChanges:te,triggerEdgeChanges:re,defaultEdgeOptions:le}=m.getState(),Ae={x:J.startX,y:J.startY},{x:Ne,y:Me}=dt(Ae,Q),De={startX:Ae.x,startY:Ae.y,x:z<Ne?z:Ne,y:X<Me?X:Me,width:Math.abs(z-Ne),height:Math.abs(X-Me)},Tt=V.current,Ue=T.current;V.current=new Set(Un(W,De,Q,n===qe.Partial,!0).map(be=>be.id)),T.current=new Set;let Qe=le?.selectable??!0;for(let be of V.current){let Oe=ee.get(be);if(Oe)for(let{edgeId:Te}of Oe.values()){let Je=U.get(Te);Je&&(Je.selectable??Qe)&&T.current.add(Te)}}if(!Uo(Tt,V.current)){let be=At(W,V.current,!0);te(be)}if(!Uo(Ue,T.current)){let be=At(U,T.current);re(be)}m.setState({userSelectionRect:De,userSelectionActive:!0,nodesSelectionActive:!1})}function L(){if(!r||!P.current)return;let[z,X]=Qn(y.current,P.current,E);C({x:z,y:X}).then(J=>{if(!$.current||!J){x.current=requestAnimationFrame(L);return}let{x:Q,y:W}=y.current;B(Q,W),x.current=requestAnimationFrame(L)})}let Z=()=>{cancelAnimationFrame(x.current),x.current=0,S.current=!1};(0,_.useEffect)(()=>()=>Z(),[]);let F=z=>{let{userSelectionRect:X,transform:J,resetSelectedElements:Q}=m.getState();if(!P.current||!X)return;let{x:W,y:U}=we(z.nativeEvent,P.current);y.current={x:W,y:U};let ee=dt({x:X.startX,y:X.startY},J);if(!$.current){let te=t?0:i;if(Math.hypot(W-ee.x,U-ee.y)<=te)return;Q(),a?.(z)}$.current=!0,S.current||(L(),S.current=!0),B(W,U)},G=z=>{if(!M){z.target===A.current&&m.getState().connection.inProgress&&(H.current=!0);return}z.button===0&&(z.target?.releasePointerCapture?.(z.pointerId),!b&&z.target===A.current&&m.getState().userSelectionRect&&N?.(z),m.setState({userSelectionActive:!1,userSelectionRect:null}),$.current&&(c?.(z),m.setState({nodesSelectionActive:V.current.size>0})),Z())},j=z=>{z.target?.releasePointerCapture?.(z.pointerId),Z()},q=o===!0||Array.isArray(o)&&o.includes(0);return(0,k.jsxs)("div",{className:ie(["react-flow__pane",{draggable:q,dragging:w,selection:e}]),onClick:M?void 0:lr(N,A),onContextMenu:lr(I,A),onWheel:lr(D,A),onPointerEnter:M?void 0:d,onPointerMove:M?F:h,onPointerUp:G,onPointerCancel:M?j:void 0,onPointerDownCapture:M?R:void 0,onClickCapture:M?O:void 0,onPointerLeave:p,ref:A,style:mo,children:[v,(0,k.jsx)(ip,{})]})}function fr({id:e,store:t,unselect:n=!1,nodeRef:o}){let{addSelectedNodes:r,unselectNodesAndEdges:i,multiSelectionActive:s,nodeLookup:a,onError:c}=t.getState(),l=a.get(e);if(!l){c?.("012",ge.error012(e));return}t.setState({nodesSelectionActive:!1}),l.selected?(n||l.selected&&s)&&(i({nodes:[l],edges:[]}),requestAnimationFrame(()=>o?.current?.blur())):r([e])}function bc({nodeRef:e,disabled:t=!1,noDragClassName:n,handleSelector:o,nodeId:r,isSelectable:i,nodeClickDistance:s}){let a=ne(),[c,l]=(0,_.useState)(!1),u=(0,_.useRef)();return(0,_.useEffect)(()=>{if(!t)return u.current=ia({getStoreItems:()=>a.getState(),onNodeMouseDown:f=>{fr({id:f,store:a,nodeRef:e})},onDragStart:()=>{l(!0)},onDragStop:()=>{l(!1)}}),()=>{u.current?.destroy(),u.current=void 0}},[t,a,e]),(0,_.useEffect)(()=>{t||!e.current||!u.current||u.current.update({noDragClassName:n,handleSelector:o,domNode:e.current,isSelectable:i,nodeId:r,nodeClickDistance:s})},[n,o,t,i,e,r,s]),c}var cp=e=>t=>t.selected&&(t.draggable||e&&typeof t.draggable>"u");function Ec(){let e=ne();return(0,_.useCallback)(n=>{let{nodeExtent:o,snapToGrid:r,snapGrid:i,nodesDraggable:s,onError:a,updateNodePositions:c,nodeLookup:l,nodeOrigin:u}=e.getState(),f=new Map,d=cp(s),h=r?i[0]:5,p=r?i[1]:5,v=n.direction.x*h*n.factor,x=n.direction.y*p*n.factor;for(let[,m]of l){if(!d(m))continue;let b={x:m.internals.positionAbsolute.x+v,y:m.internals.positionAbsolute.y+x};r&&(b=Ct(b,i));let{position:g,positionAbsolute:w}=Zo({nodeId:m.id,nextPosition:b,nodeLookup:l,nodeExtent:o,nodeOrigin:u,onError:a});m.position=g,m.internals.positionAbsolute=w,f.set(m.id,m)}c(f)},[])}var mr=(0,_.createContext)(null),lp=mr.Provider;mr.Consumer;var Ot=()=>(0,_.useContext)(mr),up=e=>({connectOnClick:e.connectOnClick,noPanClassName:e.noPanClassName,rfId:e.rfId}),Sc=(0,_.createContext)(null);function dp({children:e}){let t=K(up,oe);return(0,k.jsx)(Sc.Provider,{value:t,children:e})}function fp(){let e=(0,_.useContext)(Sc);if(!e)throw new Error("useHandleConfig must be used within a HandleConfigProvider");return e}var hp={connectingFrom:!1,connectingTo:!1,clickConnecting:!1,isPossibleEndHandle:!0,connectionInProcess:!1,clickConnectionInProcess:!1,valid:!1},pp=(e,t,n)=>o=>{let{connectionClickStartHandle:r,connectionMode:i,connection:s}=o,{fromHandle:a,toHandle:c,isValid:l}=s;if(!a&&!r)return hp;let u=c?.nodeId===e&&c?.id===t&&c?.type===n;return{connectingFrom:a?.nodeId===e&&a?.id===t&&a?.type===n,connectingTo:u,clickConnecting:r?.nodeId===e&&r?.id===t&&r?.type===n,isPossibleEndHandle:i===Le.Strict?a?.type!==n:e!==a?.nodeId||t!==a?.id,connectionInProcess:!!a,clickConnectionInProcess:!!r,valid:u&&l}};function gp({type:e="source",position:t=Y.Top,isValidConnection:n,isConnectable:o=!0,isConnectableStart:r=!0,isConnectableEnd:i=!0,id:s,onConnect:a,children:c,className:l,onMouseDown:u,onTouchStart:f,...d},h){let p=s||null,v=e==="target",x=ne(),m=Ot(),{connectOnClick:b,noPanClassName:g,rfId:w}=fp(),{connectingFrom:C,connectingTo:E,clickConnecting:M,isPossibleEndHandle:A,connectionInProcess:P,clickConnectionInProcess:V,valid:T}=K(pp(m,p,e),oe);m||x.getState().onError?.("010",ge.error010());let H=S=>{let{defaultEdgeOptions:N,onConnect:I,hasDefaultEdges:D}=x.getState(),O={...N,...S};if(D){let{edges:R,setEdges:B,onError:L}=x.getState();B(mc(O,R,{onError:L}))}I?.(O),a?.(O)},$=S=>{if(!m)return;let N=tr(S.nativeEvent);if(r&&(N&&S.button===0||!N)){let I=x.getState();so.onPointerDown(S.nativeEvent,{handleDomNode:S.currentTarget,autoPanOnConnect:I.autoPanOnConnect,connectionMode:I.connectionMode,connectionRadius:I.connectionRadius,domNode:I.domNode,nodeLookup:I.nodeLookup,lib:I.lib,isTarget:v,handleId:p,nodeId:m,flowId:I.rfId,panBy:I.panBy,cancelConnection:I.cancelConnection,onConnectStart:I.onConnectStart,onConnectEnd:(...D)=>x.getState().onConnectEnd?.(...D),updateConnection:I.updateConnection,onConnect:H,isValidConnection:n||((...D)=>x.getState().isValidConnection?.(...D)??!0),getTransform:()=>x.getState().transform,getFromHandle:()=>x.getState().connection.fromHandle,autoPanSpeed:I.autoPanSpeed,dragThreshold:I.connectionDragThreshold})}N?u?.(S):f?.(S)},y=S=>{let{onClickConnectStart:N,onClickConnectEnd:I,connectionClickStartHandle:D,connectionMode:O,isValidConnection:R,lib:B,rfId:L,nodeLookup:Z,connection:F}=x.getState();if(!m||!D&&!r)return;if(!D){N?.(S.nativeEvent,{nodeId:m,handleId:p,handleType:e}),x.setState({connectionClickStartHandle:{nodeId:m,type:e,id:p}});return}let G=jo(S.target),j=n||R,{connection:q,isValid:z}=so.isValid(S.nativeEvent,{handle:{nodeId:m,id:p,type:e},connectionMode:O,fromNodeId:D.nodeId,fromHandleId:D.id||null,fromType:D.type,isValidConnection:j,flowId:L,doc:G,lib:B,nodeLookup:Z});z&&q&&H(q);let X=structuredClone(F);delete X.inProgress,X.toPosition=X.toHandle?X.toHandle.position:null,I?.(S,X),x.setState({connectionClickStartHandle:null})};return(0,k.jsx)("div",{"data-handleid":p,"data-nodeid":m,"data-handlepos":t,"data-id":`${w}-${m}-${p}-${e}`,className:ie(["react-flow__handle",`react-flow__handle-${t}`,"nodrag",g,l,{source:!v,target:v,connectable:o,connectablestart:r,connectableend:i,clickconnecting:M,connectingfrom:C,connectingto:E,valid:T,connectionindicator:o&&(!P||A)&&(P||V?i:r)}]),onMouseDown:$,onTouchStart:$,onClick:b?y:void 0,ref:h,...d,children:c})}var hn=(0,_.memo)(xc(gp));function mp({data:e,isConnectable:t,sourcePosition:n=Y.Bottom}){return(0,k.jsxs)(k.Fragment,{children:[e?.label,(0,k.jsx)(hn,{type:"source",position:n,isConnectable:t})]})}function yp({data:e,isConnectable:t,targetPosition:n=Y.Top,sourcePosition:o=Y.Bottom}){return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(hn,{type:"target",position:n,isConnectable:t}),e?.label,(0,k.jsx)(hn,{type:"source",position:o,isConnectable:t})]})}function xp(){return null}function wp({data:e,isConnectable:t,targetPosition:n=Y.Top}){return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(hn,{type:"target",position:n,isConnectable:t}),e?.label]})}var fo={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}},Qa={input:mp,default:yp,output:wp,group:xp};function vp(e){return e.internals.handleBounds===void 0?{width:e.width??e.initialWidth??e.style?.width,height:e.height??e.initialHeight??e.style?.height}:{width:e.width??e.style?.width,height:e.height??e.style?.height}}var bp=e=>{let{width:t,height:n,x:o,y:r}=ht(e.nodeLookup,{filter:i=>!!i.selected});return{width:xe(t)?t:null,height:xe(n)?n:null,userSelectionActive:e.userSelectionActive,transformString:`translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]}) translate(${o}px,${r}px)`}};function Ep({onSelectionContextMenu:e,noPanClassName:t,disableKeyboardA11y:n}){let o=ne(),{width:r,height:i,transformString:s,userSelectionActive:a}=K(bp,oe),c=Ec(),l=(0,_.useRef)(null);(0,_.useEffect)(()=>{n||l.current?.focus({preventScroll:!0})},[n]);let u=!a&&r!==null&&i!==null;if(bc({nodeRef:l,disabled:!u}),!u)return null;let f=e?h=>{let p=o.getState().nodes.filter(v=>v.selected);e(h,p)}:void 0,d=h=>{Object.prototype.hasOwnProperty.call(fo,h.key)&&(h.preventDefault(),c({direction:fo[h.key],factor:h.shiftKey?4:1}))};return(0,k.jsx)("div",{className:ie(["react-flow__nodesselection","react-flow__container",t]),style:{transform:s},children:(0,k.jsx)("div",{ref:l,className:"react-flow__nodesselection-rect",onContextMenu:f,tabIndex:n?void 0:-1,onKeyDown:n?void 0:d,style:{width:r,height:i}})})}var Ja=typeof window<"u"?window:void 0,Sp=e=>({nodesSelectionActive:e.nodesSelectionActive,userSelectionActive:e.userSelectionActive});function _c({children:e,onPaneClick:t,onPaneMouseEnter:n,onPaneMouseMove:o,onPaneMouseLeave:r,onPaneContextMenu:i,onPaneScroll:s,paneClickDistance:a,deleteKeyCode:c,selectionKeyCode:l,selectionOnDrag:u,selectionMode:f,onSelectionStart:d,onSelectionEnd:h,multiSelectionKeyCode:p,panActivationKeyCode:v,zoomActivationKeyCode:x,elementsSelectable:m,zoomOnScroll:b,zoomOnPinch:g,panOnScroll:w,panOnScrollSpeed:C,panOnScrollMode:E,zoomOnDoubleClick:M,panOnDrag:A,autoPanOnSelection:P,defaultViewport:V,translateExtent:T,minZoom:H,maxZoom:$,preventScrolling:y,onSelectionContextMenu:S,noWheelClassName:N,noPanClassName:I,disableKeyboardA11y:D,onViewportChange:O,isControlledViewport:R}){let{nodesSelectionActive:B,userSelectionActive:L}=K(Sp,oe),Z=Dt(l,{target:Ja}),F=Dt(v,{target:Ja}),G=F||A,j=F||w,q=u&&G!==!0,z=Z||L||q;return ep({deleteKeyCode:c,multiSelectionKeyCode:p}),(0,k.jsx)(op,{onPaneContextMenu:i,elementsSelectable:m,zoomOnScroll:b,zoomOnPinch:g,panOnScroll:j,panActivationKeyPressed:F,panOnScrollSpeed:C,panOnScrollMode:E,zoomOnDoubleClick:M,panOnDrag:!Z&&G,defaultViewport:V,translateExtent:T,minZoom:H,maxZoom:$,zoomActivationKeyCode:x,preventScrolling:y,noWheelClassName:N,noPanClassName:I,onViewportChange:O,isControlledViewport:R,paneClickDistance:a,selectionOnDrag:q,children:(0,k.jsxs)(ap,{onSelectionStart:d,onSelectionEnd:h,onPaneClick:t,onPaneMouseEnter:n,onPaneMouseMove:o,onPaneMouseLeave:r,onPaneContextMenu:i,onPaneScroll:s,panOnDrag:G,autoPanOnSelection:P,isSelecting:!!z,selectionMode:f,selectionKeyPressed:Z,paneClickDistance:a,selectionOnDrag:q,children:[e,B&&(0,k.jsx)(Ep,{onSelectionContextMenu:S,noPanClassName:I,disableKeyboardA11y:D})]})})}_c.displayName="FlowRenderer";var _p=(0,_.memo)(_c),Cp=e=>t=>e?Un(t.nodeLookup,{x:0,y:0,width:t.width,height:t.height},t.transform,!0).map(n=>n.id):Array.from(t.nodeLookup.keys());function Np(e){return K((0,_.useCallback)(Cp(e),[e]),oe)}var Mp=e=>e.updateNodeInternals;function Ip(){let e=K(Mp),[t]=(0,_.useState)(()=>typeof ResizeObserver>"u"?null:new ResizeObserver(n=>{let o=new Map;n.forEach(r=>{let i=r.target.getAttribute("data-id");o.set(i,{id:i,nodeElement:r.target,force:!0})}),e(o)}));return(0,_.useEffect)(()=>()=>{t?.disconnect()},[t]),t}function kp({node:e,nodeType:t,hasDimensions:n,resizeObserver:o}){let r=ne(),i=(0,_.useRef)(null),s=(0,_.useRef)(null),a=(0,_.useRef)(e.sourcePosition),c=(0,_.useRef)(e.targetPosition),l=(0,_.useRef)(t),u=n&&!!e.internals.handleBounds;return(0,_.useEffect)(()=>{i.current&&!e.hidden&&(!u||s.current!==i.current)&&(s.current&&o?.unobserve(s.current),o?.observe(i.current),s.current=i.current)},[u,e.hidden]),(0,_.useEffect)(()=>()=>{s.current&&(o?.unobserve(s.current),s.current=null)},[]),(0,_.useEffect)(()=>{if(i.current){let f=l.current!==t,d=a.current!==e.sourcePosition,h=c.current!==e.targetPosition;(f||d||h)&&(l.current=t,a.current=e.sourcePosition,c.current=e.targetPosition,r.getState().updateNodeInternals(new Map([[e.id,{id:e.id,nodeElement:i.current,force:!0}]])))}},[e.id,t,e.sourcePosition,e.targetPosition]),i}function Pp({id:e,onClick:t,onMouseEnter:n,onMouseMove:o,onMouseLeave:r,onContextMenu:i,onDoubleClick:s,nodesDraggable:a,elementsSelectable:c,nodesConnectable:l,nodesFocusable:u,resizeObserver:f,noDragClassName:d,noPanClassName:h,disableKeyboardA11y:p,rfId:v,nodeTypes:x,nodeClickDistance:m,onError:b}){let{node:g,internals:w,isParent:C}=K(z=>{let X=z.nodeLookup.get(e),J=z.parentLookup.has(e);return{node:X,internals:X.internals,isParent:J}},oe),E=g.type||"default",M=x?.[E]||Qa[E];M===void 0&&(b?.("003",ge.error003(E)),E="default",M=x?.default||Qa.default);let A=!!(g.draggable||a&&typeof g.draggable>"u"),P=!!(g.selectable||c&&typeof g.selectable>"u"),V=!!(g.connectable||l&&typeof g.connectable>"u"),T=!!(g.focusable||u&&typeof g.focusable>"u"),H=ne(),$=eo(g),y=kp({node:g,nodeType:E,hasDimensions:$,resizeObserver:f}),S=bc({nodeRef:y,disabled:g.hidden||!A,noDragClassName:d,handleSelector:g.dragHandle,nodeId:e,isSelectable:P,nodeClickDistance:m}),N=Ec();if(g.hidden)return null;let I=ve(g),D=vp(g),O=P||A||t||n||o||r,R=n?z=>n(z,{...w.userNode}):void 0,B=o?z=>o(z,{...w.userNode}):void 0,L=r?z=>r(z,{...w.userNode}):void 0,Z=i?z=>i(z,{...w.userNode}):void 0,F=s?z=>s(z,{...w.userNode}):void 0,G=z=>{let{selectNodesOnDrag:X,nodeDragThreshold:J}=H.getState();P&&(!X||!A||J>0)&&fr({id:e,store:H,nodeRef:y}),t&&t(z,{...w.userNode})},j=z=>{if(!(er(z.nativeEvent)||p)){if(Lo.includes(z.key)&&P){let X=z.key==="Escape";fr({id:e,store:H,unselect:X,nodeRef:y})}else if(A&&g.selected&&Object.prototype.hasOwnProperty.call(fo,z.key)){z.preventDefault();let{ariaLabelConfig:X}=H.getState();H.setState({ariaLiveMessage:X["node.a11yDescription.ariaLiveMessage"]({direction:z.key.replace("Arrow","").toLowerCase(),x:~~w.positionAbsolute.x,y:~~w.positionAbsolute.y})}),N({direction:fo[z.key],factor:z.shiftKey?4:1})}}},q=()=>{if(p||!y.current?.matches(":focus-visible"))return;let{transform:z,width:X,height:J,autoPanOnNodeFocus:Q,setCenter:W}=H.getState();if(!Q)return;Un(new Map([[e,g]]),{x:0,y:0,width:X,height:J},z,!0).length>0||W(g.position.x+I.width/2,g.position.y+I.height/2,{zoom:z[2]})};return(0,k.jsx)("div",{className:ie(["react-flow__node",`react-flow__node-${E}`,{[h]:A},g.className,{selected:g.selected,selectable:P,parent:C,draggable:A,dragging:S}]),ref:y,style:{zIndex:w.z,transform:`translate(${w.positionAbsolute.x}px,${w.positionAbsolute.y}px)`,pointerEvents:O?"all":"none",visibility:$?"visible":"hidden",...g.style,...D},"data-id":e,"data-testid":`rf__node-${e}`,onMouseEnter:R,onMouseMove:B,onMouseLeave:L,onContextMenu:Z,onClick:G,onDoubleClick:F,onKeyDown:T?j:void 0,tabIndex:T?0:void 0,onFocus:T?q:void 0,role:g.ariaRole??(T?"group":void 0),"aria-roledescription":"node","aria-describedby":p?void 0:`${dc}-${v}`,"aria-label":g.ariaLabel,...g.domAttributes,children:(0,k.jsx)(lp,{value:e,children:(0,k.jsx)(M,{id:e,data:g.data,type:E,positionAbsoluteX:w.positionAbsolute.x,positionAbsoluteY:w.positionAbsolute.y,selected:g.selected??!1,selectable:P,draggable:A,deletable:g.deletable??!0,isConnectable:V,sourcePosition:g.sourcePosition,targetPosition:g.targetPosition,dragging:S,dragHandle:g.dragHandle,zIndex:w.z,parentId:g.parentId,...I})})})}var Ap=(0,_.memo)(Pp),Dp=e=>({nodesConnectable:e.nodesConnectable,nodesFocusable:e.nodesFocusable,elementsSelectable:e.elementsSelectable,onError:e.onError});function Cc(e){let{nodesConnectable:t,nodesFocusable:n,elementsSelectable:o,onError:r}=K(Dp,oe),i=Np(e.onlyRenderVisibleElements),s=Ip();return(0,k.jsx)("div",{className:"react-flow__nodes",style:mo,children:i.map(a=>(0,k.jsx)(Ap,{id:a,nodeTypes:e.nodeTypes,nodeExtent:e.nodeExtent,onClick:e.onNodeClick,onMouseEnter:e.onNodeMouseEnter,onMouseMove:e.onNodeMouseMove,onMouseLeave:e.onNodeMouseLeave,onContextMenu:e.onNodeContextMenu,onDoubleClick:e.onNodeDoubleClick,noDragClassName:e.noDragClassName,noPanClassName:e.noPanClassName,rfId:e.rfId,disableKeyboardA11y:e.disableKeyboardA11y,resizeObserver:s,nodesDraggable:e.nodesDraggable??!0,nodesConnectable:t,nodesFocusable:n,elementsSelectable:o,nodeClickDistance:e.nodeClickDistance,onError:r},a))})}Cc.displayName="NodeRenderer";var Op=(0,_.memo)(Cc);function Tp(e){return K((0,_.useCallback)(n=>{if(!e)return n.edges.map(r=>r.id);let o=[];if(n.width&&n.height)for(let r of n.edges){let i=n.nodeLookup.get(r.source),s=n.nodeLookup.get(r.target);i&&s&&Ys({sourceNode:i,targetNode:s,width:n.width,height:n.height,transform:n.transform})&&o.push(r.id)}return o},[e]),oe)}var zp=({color:e="none",strokeWidth:t=1})=>{let n={strokeWidth:t,...e&&{stroke:e}};return(0,k.jsx)("polyline",{className:"arrow",style:n,strokeLinecap:"round",fill:"none",strokeLinejoin:"round",points:"-5,-4 0,0 -5,4"})},$p=({color:e="none",strokeWidth:t=1})=>{let n={strokeWidth:t,...e&&{stroke:e,fill:e}};return(0,k.jsx)("polyline",{className:"arrowclosed",style:n,strokeLinecap:"round",strokeLinejoin:"round",points:"-5,-4 0,0 -5,4 -5,-4"})},ja={[lt.Arrow]:zp,[lt.ArrowClosed]:$p};function Rp(e){let t=ne();return(0,_.useMemo)(()=>Object.prototype.hasOwnProperty.call(ja,e)?ja[e]:(t.getState().onError?.("009",ge.error009(e)),null),[e])}var Hp=({id:e,type:t,color:n,width:o=12.5,height:r=12.5,markerUnits:i="strokeWidth",strokeWidth:s,orient:a="auto-start-reverse"})=>{let c=Rp(t);return c?(0,k.jsx)("marker",{className:"react-flow__arrowhead",id:e,markerWidth:`${o}`,markerHeight:`${r}`,viewBox:"-10 -10 20 20",markerUnits:i,orient:a,refX:"0",refY:"0",children:(0,k.jsx)(c,{color:n,strokeWidth:s})}):null},Nc=({defaultColor:e,rfId:t})=>{let n=K(i=>i.edges),o=K(i=>i.defaultEdgeOptions),r=(0,_.useMemo)(()=>Ks(n,{id:t,defaultColor:e,defaultMarkerStart:o?.markerStart,defaultMarkerEnd:o?.markerEnd}),[n,o,t,e]);return r.length?(0,k.jsx)("svg",{className:"react-flow__marker","aria-hidden":"true",children:(0,k.jsx)("defs",{children:r.map(i=>(0,k.jsx)(Hp,{id:i.id,type:i.type,color:i.color,width:i.width,height:i.height,markerUnits:i.markerUnits,strokeWidth:i.strokeWidth,orient:i.orient},i.id))})}):null};Nc.displayName="MarkerDefinitions";var Lp=(0,_.memo)(Nc);function Mc({x:e,y:t,label:n,labelStyle:o,labelShowBg:r=!0,labelBgStyle:i,labelBgPadding:s=[2,4],labelBgBorderRadius:a=2,children:c,className:l,...u}){let[f,d]=(0,_.useState)({x:1,y:0,width:0,height:0}),h=ie(["react-flow__edge-textwrapper",l]),p=(0,_.useRef)(null);return(0,_.useEffect)(()=>{if(p.current){let v=p.current.getBBox();d({x:v.x,y:v.y,width:v.width,height:v.height})}},[n]),n?(0,k.jsxs)("g",{transform:`translate(${e-f.width/2} ${t-f.height/2})`,className:h,visibility:f.width?"visible":"hidden",...u,children:[r&&(0,k.jsx)("rect",{width:f.width+2*s[0],x:-s[0],y:-s[1],height:f.height+2*s[1],className:"react-flow__edge-textbg",style:i,rx:a,ry:a}),(0,k.jsx)("text",{className:"react-flow__edge-text",y:f.height/2,dy:"0.3em",ref:p,style:o,children:n}),c]}):null}Mc.displayName="EdgeText";var Ic=(0,_.memo)(Mc);function gn({path:e,labelX:t,labelY:n,label:o,labelStyle:r,labelShowBg:i,labelBgStyle:s,labelBgPadding:a,labelBgBorderRadius:c,interactionWidth:l=20,...u}){return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)("path",{...u,d:e,fill:"none",className:ie(["react-flow__edge-path",u.className])}),l?(0,k.jsx)("path",{d:e,fill:"none",strokeOpacity:0,strokeWidth:l,className:"react-flow__edge-interaction"}):null,o&&xe(t)&&xe(n)?(0,k.jsx)(Ic,{x:t,y:n,label:o,labelStyle:r,labelShowBg:i,labelBgStyle:s,labelBgPadding:a,labelBgBorderRadius:c}):null]})}function ec({pos:e,x1:t,y1:n,x2:o,y2:r}){return e===Y.Left||e===Y.Right?[.5*(t+o),n]:[t,.5*(n+r)]}function yr({sourceX:e,sourceY:t,sourcePosition:n=Y.Bottom,targetX:o,targetY:r,targetPosition:i=Y.Top}){let[s,a]=ec({pos:n,x1:e,y1:t,x2:o,y2:r}),[c,l]=ec({pos:i,x1:o,y1:r,x2:e,y2:t}),[u,f,d,h]=cn({sourceX:e,sourceY:t,targetX:o,targetY:r,sourceControlX:s,sourceControlY:a,targetControlX:c,targetControlY:l});return[`M${e},${t} C${s},${a} ${c},${l} ${o},${r}`,u,f,d,h]}function kc(e){return(0,_.memo)(({id:t,sourceX:n,sourceY:o,targetX:r,targetY:i,sourcePosition:s,targetPosition:a,label:c,labelStyle:l,labelShowBg:u,labelBgStyle:f,labelBgPadding:d,labelBgBorderRadius:h,style:p,markerEnd:v,markerStart:x,interactionWidth:m})=>{let[b,g,w]=yr({sourceX:n,sourceY:o,sourcePosition:s,targetX:r,targetY:i,targetPosition:a}),C=e.isInternal?void 0:t;return(0,k.jsx)(gn,{id:C,path:b,labelX:g,labelY:w,label:c,labelStyle:l,labelShowBg:u,labelBgStyle:f,labelBgPadding:d,labelBgBorderRadius:h,style:p,markerEnd:v,markerStart:x,interactionWidth:m})})}var Pc=kc({isInternal:!1}),Ac=kc({isInternal:!0});Pc.displayName="SimpleBezierEdge";Ac.displayName="SimpleBezierEdgeInternal";function Dc(e){return(0,_.memo)(({id:t,sourceX:n,sourceY:o,targetX:r,targetY:i,label:s,labelStyle:a,labelShowBg:c,labelBgStyle:l,labelBgPadding:u,labelBgBorderRadius:f,style:d,sourcePosition:h=Y.Bottom,targetPosition:p=Y.Top,markerEnd:v,markerStart:x,pathOptions:m,interactionWidth:b})=>{let[g,w,C]=kt({sourceX:n,sourceY:o,sourcePosition:h,targetX:r,targetY:i,targetPosition:p,borderRadius:m?.borderRadius,offset:m?.offset,stepPosition:m?.stepPosition}),E=e.isInternal?void 0:t;return(0,k.jsx)(gn,{id:E,path:g,labelX:w,labelY:C,label:s,labelStyle:a,labelShowBg:c,labelBgStyle:l,labelBgPadding:u,labelBgBorderRadius:f,style:d,markerEnd:v,markerStart:x,interactionWidth:b})})}var xr=Dc({isInternal:!1}),Oc=Dc({isInternal:!0});xr.displayName="SmoothStepEdge";Oc.displayName="SmoothStepEdgeInternal";function Tc(e){return(0,_.memo)(({id:t,...n})=>{let o=e.isInternal?void 0:t;return(0,k.jsx)(xr,{...n,id:o,pathOptions:(0,_.useMemo)(()=>({borderRadius:0,offset:n.pathOptions?.offset}),[n.pathOptions?.offset])})})}var zc=Tc({isInternal:!1}),$c=Tc({isInternal:!0});zc.displayName="StepEdge";$c.displayName="StepEdgeInternal";function Rc(e){return(0,_.memo)(({id:t,sourceX:n,sourceY:o,targetX:r,targetY:i,label:s,labelStyle:a,labelShowBg:c,labelBgStyle:l,labelBgPadding:u,labelBgBorderRadius:f,style:d,markerEnd:h,markerStart:p,interactionWidth:v})=>{let[x,m,b]=un({sourceX:n,sourceY:o,targetX:r,targetY:i}),g=e.isInternal?void 0:t;return(0,k.jsx)(gn,{id:g,path:x,labelX:m,labelY:b,label:s,labelStyle:a,labelShowBg:c,labelBgStyle:l,labelBgPadding:u,labelBgBorderRadius:f,style:d,markerEnd:h,markerStart:p,interactionWidth:v})})}var Hc=Rc({isInternal:!1}),Lc=Rc({isInternal:!0});Hc.displayName="StraightEdge";Lc.displayName="StraightEdgeInternal";function Bc(e){return(0,_.memo)(({id:t,sourceX:n,sourceY:o,targetX:r,targetY:i,sourcePosition:s=Y.Bottom,targetPosition:a=Y.Top,label:c,labelStyle:l,labelShowBg:u,labelBgStyle:f,labelBgPadding:d,labelBgBorderRadius:h,style:p,markerEnd:v,markerStart:x,pathOptions:m,interactionWidth:b})=>{let[g,w,C]=ln({sourceX:n,sourceY:o,sourcePosition:s,targetX:r,targetY:i,targetPosition:a,curvature:m?.curvature}),E=e.isInternal?void 0:t;return(0,k.jsx)(gn,{id:E,path:g,labelX:w,labelY:C,label:c,labelStyle:l,labelShowBg:u,labelBgStyle:f,labelBgPadding:d,labelBgBorderRadius:h,style:p,markerEnd:v,markerStart:x,interactionWidth:b})})}var Vc=Bc({isInternal:!1}),Fc=Bc({isInternal:!0});Vc.displayName="BezierEdge";Fc.displayName="BezierEdgeInternal";var tc={default:Fc,straight:Lc,step:$c,smoothstep:Oc,simplebezier:Ac},nc={sourceX:null,sourceY:null,targetX:null,targetY:null,sourcePosition:null,targetPosition:null,zIndex:void 0},Bp=(e,t,n)=>n===Y.Left?e-t:n===Y.Right?e+t:e,Vp=(e,t,n)=>n===Y.Top?e-t:n===Y.Bottom?e+t:e,oc="react-flow__edgeupdater";function rc({position:e,centerX:t,centerY:n,radius:o=10,onMouseDown:r,onMouseEnter:i,onMouseOut:s,type:a}){return(0,k.jsx)("circle",{onMouseDown:r,onMouseEnter:i,onMouseOut:s,className:ie([oc,`${oc}-${a}`]),cx:Bp(t,o,e),cy:Vp(n,o,e),r:o,stroke:"transparent",fill:"transparent"})}function Fp({isReconnectable:e,reconnectRadius:t,edge:n,sourceX:o,sourceY:r,targetX:i,targetY:s,sourcePosition:a,targetPosition:c,onReconnect:l,onReconnectStart:u,onReconnectEnd:f,setReconnecting:d,setUpdateHover:h}){let p=ne(),v=(w,C)=>{if(w.button!==0)return;let{autoPanOnConnect:E,domNode:M,connectionMode:A,connectionRadius:P,lib:V,onConnectStart:T,cancelConnection:H,nodeLookup:$,rfId:y,panBy:S,updateConnection:N}=p.getState(),I=C.type==="target",D=(B,L)=>{d(!1),f?.(B,n,C.type,L)},O=B=>l?.(n,B),R=(B,L)=>{d(!0),u?.(w,n,C.type),T?.(B,L)};so.onPointerDown(w.nativeEvent,{autoPanOnConnect:E,connectionMode:A,connectionRadius:P,domNode:M,handleId:C.id,nodeId:C.nodeId,nodeLookup:$,isTarget:I,edgeUpdaterType:C.type,lib:V,flowId:y,cancelConnection:H,panBy:S,isValidConnection:(...B)=>p.getState().isValidConnection?.(...B)??!0,onConnect:O,onConnectStart:R,onConnectEnd:(...B)=>p.getState().onConnectEnd?.(...B),onReconnectEnd:D,updateConnection:N,getTransform:()=>p.getState().transform,getFromHandle:()=>p.getState().connection.fromHandle,dragThreshold:p.getState().connectionDragThreshold,handleDomNode:w.currentTarget})},x=w=>v(w,{nodeId:n.target,id:n.targetHandle??null,type:"target"}),m=w=>v(w,{nodeId:n.source,id:n.sourceHandle??null,type:"source"}),b=()=>h(!0),g=()=>h(!1);return(0,k.jsxs)(k.Fragment,{children:[(e===!0||e==="source")&&(0,k.jsx)(rc,{position:a,centerX:o,centerY:r,radius:t,onMouseDown:x,onMouseEnter:b,onMouseOut:g,type:"source"}),(e===!0||e==="target")&&(0,k.jsx)(rc,{position:c,centerX:i,centerY:s,radius:t,onMouseDown:m,onMouseEnter:b,onMouseOut:g,type:"target"})]})}function Xp({id:e,edgesFocusable:t,edgesReconnectable:n,elementsSelectable:o,onClick:r,onDoubleClick:i,onContextMenu:s,onMouseEnter:a,onMouseMove:c,onMouseLeave:l,reconnectRadius:u,onReconnect:f,onReconnectStart:d,onReconnectEnd:h,rfId:p,edgeTypes:v,noPanClassName:x,onError:m,disableKeyboardA11y:b}){let g=K(W=>W.edgeLookup.get(e)),w=K(W=>W.defaultEdgeOptions);g=w?{...w,...g}:g;let C=g.type||"default",E=v?.[C]||tc[C];E===void 0&&(m?.("011",ge.error011(C)),C="default",E=v?.default||tc.default);let M=!!(g.focusable||t&&typeof g.focusable>"u"),A=typeof f<"u"&&(g.reconnectable||n&&typeof g.reconnectable>"u"),P=!!(g.selectable||o&&typeof g.selectable>"u"),V=(0,_.useRef)(null),[T,H]=(0,_.useState)(!1),[$,y]=(0,_.useState)(!1),S=ne(),{zIndex:N=g.zIndex,sourceX:I,sourceY:D,targetX:O,targetY:R,sourcePosition:B,targetPosition:L}=K((0,_.useCallback)(W=>{let U=W.nodeLookup.get(g.source),ee=W.nodeLookup.get(g.target);if(!U||!ee)return nc;let te=Gs({id:e,sourceNode:U,targetNode:ee,sourceHandle:g.sourceHandle||null,targetHandle:g.targetHandle||null,connectionMode:W.connectionMode,onError:m}),re=Xs({selected:g.selected,zIndex:g.zIndex,sourceNode:U,targetNode:ee,elevateOnSelect:W.elevateEdgesOnSelect,zIndexMode:W.zIndexMode});return{...te||nc,zIndex:re}},[g.source,g.target,g.sourceHandle,g.targetHandle,g.selected,g.zIndex,m]),oe),Z=(0,_.useMemo)(()=>g.markerStart?`url('#${oo(g.markerStart,p)}')`:void 0,[g.markerStart,p]),F=(0,_.useMemo)(()=>g.markerEnd?`url('#${oo(g.markerEnd,p)}')`:void 0,[g.markerEnd,p]);if(g.hidden||I===null||D===null||O===null||R===null)return null;let G=W=>{let{addSelectedEdges:U,unselectNodesAndEdges:ee,multiSelectionActive:te}=S.getState();P&&(S.setState({nodesSelectionActive:!1}),g.selected&&te?(ee({nodes:[],edges:[g]}),V.current?.blur()):U([e])),r&&r(W,g)},j=i?W=>{i(W,{...g})}:void 0,q=s?W=>{s(W,{...g})}:void 0,z=a?W=>{a(W,{...g})}:void 0,X=c?W=>{c(W,{...g})}:void 0,J=l?W=>{l(W,{...g})}:void 0,Q=W=>{if(!b&&Lo.includes(W.key)&&P){let{unselectNodesAndEdges:U,addSelectedEdges:ee}=S.getState();W.key==="Escape"?(V.current?.blur(),U({edges:[g]})):ee([e])}};return(0,k.jsx)("svg",{style:{zIndex:N},children:(0,k.jsxs)("g",{className:ie(["react-flow__edge",`react-flow__edge-${C}`,g.className,x,{selected:g.selected,animated:g.animated,inactive:!P&&!r,updating:T,selectable:P}]),onClick:G,onDoubleClick:j,onContextMenu:q,onMouseEnter:z,onMouseMove:X,onMouseLeave:J,onKeyDown:M?Q:void 0,tabIndex:M?0:void 0,role:g.ariaRole??(M?"group":"img"),"aria-roledescription":"edge","data-id":e,"data-testid":`rf__edge-${e}`,"aria-label":g.ariaLabel===null?void 0:g.ariaLabel||`Edge from ${g.source} to ${g.target}`,"aria-describedby":M?`${fc}-${p}`:void 0,ref:V,...g.domAttributes,children:[!$&&(0,k.jsx)(E,{id:e,source:g.source,target:g.target,type:g.type,selected:g.selected,animated:g.animated,selectable:P,deletable:g.deletable??!0,label:g.label,labelStyle:g.labelStyle,labelShowBg:g.labelShowBg,labelBgStyle:g.labelBgStyle,labelBgPadding:g.labelBgPadding,labelBgBorderRadius:g.labelBgBorderRadius,sourceX:I,sourceY:D,targetX:O,targetY:R,sourcePosition:B,targetPosition:L,data:g.data,style:g.style,sourceHandleId:g.sourceHandle,targetHandleId:g.targetHandle,markerStart:Z,markerEnd:F,pathOptions:"pathOptions"in g?g.pathOptions:void 0,interactionWidth:g.interactionWidth}),A&&(0,k.jsx)(Fp,{edge:g,isReconnectable:A,reconnectRadius:u,onReconnect:f,onReconnectStart:d,onReconnectEnd:h,sourceX:I,sourceY:D,targetX:O,targetY:R,sourcePosition:B,targetPosition:L,setUpdateHover:H,setReconnecting:y})]})})}var Yp=(0,_.memo)(Xp),Zp=e=>({edgesFocusable:e.edgesFocusable,edgesReconnectable:e.edgesReconnectable,elementsSelectable:e.elementsSelectable,connectionMode:e.connectionMode,onError:e.onError});function Xc({defaultMarkerColor:e,onlyRenderVisibleElements:t,rfId:n,edgeTypes:o,noPanClassName:r,onReconnect:i,onEdgeContextMenu:s,onEdgeMouseEnter:a,onEdgeMouseMove:c,onEdgeMouseLeave:l,onEdgeClick:u,reconnectRadius:f,onEdgeDoubleClick:d,onReconnectStart:h,onReconnectEnd:p,disableKeyboardA11y:v}){let{edgesFocusable:x,edgesReconnectable:m,elementsSelectable:b,onError:g}=K(Zp,oe),w=Tp(t);return(0,k.jsxs)("div",{className:"react-flow__edges",children:[(0,k.jsx)(Lp,{defaultColor:e,rfId:n}),w.map(C=>(0,k.jsx)(Yp,{id:C,edgesFocusable:x,edgesReconnectable:m,elementsSelectable:b,noPanClassName:r,onReconnect:i,onContextMenu:s,onMouseEnter:a,onMouseMove:c,onMouseLeave:l,onClick:u,reconnectRadius:f,onDoubleClick:d,onReconnectStart:h,onReconnectEnd:p,rfId:n,onError:g,edgeTypes:o,disableKeyboardA11y:v},C))]})}Xc.displayName="EdgeRenderer";var Wp=(0,_.memo)(Xc),ic=e=>`translate(${e[0]}px,${e[1]}px) scale(${e[2]})`;function qp({children:e}){let t=ne(),n=(0,_.useRef)(null),[o]=(0,_.useState)(()=>t.getState().transform);return wc(()=>{let r=null,i=()=>{let s=t.getState().transform;r&&s[0]===r[0]&&s[1]===r[1]&&s[2]===r[2]||(r=s,n.current&&(n.current.style.transform=ic(s)))};return i(),t.subscribe(i)},[t]),(0,k.jsx)("div",{ref:n,className:"react-flow__viewport xyflow__viewport react-flow__container",style:{transform:ic(o)},children:e})}function Gp(e){let t=go(),n=(0,_.useRef)(!1);(0,_.useEffect)(()=>{!n.current&&t.viewportInitialized&&e&&(setTimeout(()=>e(t),1),n.current=!0)},[e,t.viewportInitialized])}var Kp=e=>e.panZoom?.syncViewport;function Up(e){let t=K(Kp),n=ne();return(0,_.useEffect)(()=>{e&&(t?.(e),n.setState({transform:[e.x,e.y,e.zoom]}))},[e,t]),null}function sc(e){return e.connection.inProgress?{...e.connection,to:Nt(e.connection.to,e.transform)}:{...e.connection}}function Qp(e){return e?n=>{let o=sc(n);return e(o)}:sc}function Yc(e){let t=Qp(e);return K(t,oe)}var Jp=e=>({nodesConnectable:e.nodesConnectable,isValid:e.connection.isValid,inProgress:e.connection.inProgress,width:e.width,height:e.height});function jp({containerStyle:e,style:t,type:n,component:o}){let{nodesConnectable:r,width:i,height:s,isValid:a,inProgress:c}=K(Jp,oe);return!(i&&r&&c)?null:(0,k.jsx)("svg",{style:e,width:i,height:s,className:"react-flow__connectionline react-flow__container",children:(0,k.jsx)("g",{className:ie(["react-flow__connection",Jo(a)]),children:(0,k.jsx)(Zc,{style:t,type:n,CustomComponent:o,isValid:a})})})}var Zc=({style:e,type:t=Ce.Bezier,CustomComponent:n,isValid:o})=>{let{inProgress:r,from:i,fromNode:s,fromHandle:a,fromPosition:c,to:l,toNode:u,toHandle:f,toPosition:d,pointer:h}=Yc();if(!r)return;if(n)return(0,k.jsx)(n,{connectionLineType:t,connectionLineStyle:e,fromNode:s,fromHandle:a,fromX:i.x,fromY:i.y,toX:l.x,toY:l.y,fromPosition:c,toPosition:d,connectionStatus:Jo(o),toNode:u,toHandle:f,pointer:h});let p="",v={sourceX:i.x,sourceY:i.y,sourcePosition:c,targetX:l.x,targetY:l.y,targetPosition:d};switch(t){case Ce.Bezier:[p]=ln(v);break;case Ce.SimpleBezier:[p]=yr(v);break;case Ce.Step:[p]=kt({...v,borderRadius:0});break;case Ce.SmoothStep:[p]=kt(v);break;default:[p]=un(v)}return(0,k.jsx)("path",{d:p,fill:"none",className:"react-flow__connection-path",style:e})};Zc.displayName="ConnectionLine";var eg={};function ac(e=eg){let t=(0,_.useRef)(e),n=ne();(0,_.useEffect)(()=>{},[e])}function tg(){let e=ne(),t=(0,_.useRef)(!1);(0,_.useEffect)(()=>{},[])}function Wc({nodeTypes:e,edgeTypes:t,onInit:n,onNodeClick:o,onEdgeClick:r,onNodeDoubleClick:i,onEdgeDoubleClick:s,onNodeMouseEnter:a,onNodeMouseMove:c,onNodeMouseLeave:l,onNodeContextMenu:u,onSelectionContextMenu:f,onSelectionStart:d,onSelectionEnd:h,connectionLineType:p,connectionLineStyle:v,connectionLineComponent:x,connectionLineContainerStyle:m,selectionKeyCode:b,selectionOnDrag:g,selectionMode:w,multiSelectionKeyCode:C,panActivationKeyCode:E,zoomActivationKeyCode:M,deleteKeyCode:A,onlyRenderVisibleElements:P,elementsSelectable:V,defaultViewport:T,translateExtent:H,minZoom:$,maxZoom:y,preventScrolling:S,defaultMarkerColor:N,zoomOnScroll:I,zoomOnPinch:D,panOnScroll:O,panOnScrollSpeed:R,panOnScrollMode:B,zoomOnDoubleClick:L,panOnDrag:Z,autoPanOnSelection:F,onPaneClick:G,onPaneMouseEnter:j,onPaneMouseMove:q,onPaneMouseLeave:z,onPaneScroll:X,onPaneContextMenu:J,paneClickDistance:Q,nodeClickDistance:W,onEdgeContextMenu:U,onEdgeMouseEnter:ee,onEdgeMouseMove:te,onEdgeMouseLeave:re,reconnectRadius:le,onReconnect:Ae,onReconnectStart:Ne,onReconnectEnd:Me,noDragClassName:De,noWheelClassName:Tt,noPanClassName:Ue,disableKeyboardA11y:Qe,nodeExtent:be,rfId:Oe,viewport:Te,onViewportChange:Je,nodesDraggable:yo}){return ac(e),ac(t),tg(),Gp(n),Up(Te),(0,k.jsx)(_p,{onPaneClick:G,onPaneMouseEnter:j,onPaneMouseMove:q,onPaneMouseLeave:z,onPaneContextMenu:J,onPaneScroll:X,paneClickDistance:Q,deleteKeyCode:A,selectionKeyCode:b,selectionOnDrag:g,selectionMode:w,onSelectionStart:d,onSelectionEnd:h,multiSelectionKeyCode:C,panActivationKeyCode:E,zoomActivationKeyCode:M,elementsSelectable:V,zoomOnScroll:I,zoomOnPinch:D,zoomOnDoubleClick:L,panOnScroll:O,panOnScrollSpeed:R,panOnScrollMode:B,panOnDrag:Z,autoPanOnSelection:F,defaultViewport:T,translateExtent:H,minZoom:$,maxZoom:y,onSelectionContextMenu:f,preventScrolling:S,noDragClassName:De,noWheelClassName:Tt,noPanClassName:Ue,disableKeyboardA11y:Qe,onViewportChange:Je,isControlledViewport:!!Te,children:(0,k.jsxs)(qp,{children:[(0,k.jsx)(Wp,{edgeTypes:t,onEdgeClick:r,onEdgeDoubleClick:s,onReconnect:Ae,onReconnectStart:Ne,onReconnectEnd:Me,onlyRenderVisibleElements:P,onEdgeContextMenu:U,onEdgeMouseEnter:ee,onEdgeMouseMove:te,onEdgeMouseLeave:re,reconnectRadius:le,defaultMarkerColor:N,noPanClassName:Ue,disableKeyboardA11y:Qe,rfId:Oe}),(0,k.jsx)(jp,{style:v,type:p,component:x,containerStyle:m}),(0,k.jsx)("div",{className:"react-flow__edgelabel-renderer"}),(0,k.jsx)(Op,{nodeTypes:e,onNodeClick:o,onNodeDoubleClick:i,onNodeMouseEnter:a,onNodeMouseMove:c,onNodeMouseLeave:l,onNodeContextMenu:u,nodeClickDistance:W,onlyRenderVisibleElements:P,noPanClassName:Ue,noDragClassName:De,disableKeyboardA11y:Qe,nodeExtent:be,rfId:Oe,nodesDraggable:yo}),(0,k.jsx)("div",{className:"react-flow__viewport-portal"})]})})}Wc.displayName="GraphView";var ng=(0,_.memo)(Wc),og=Go("React Flow","https://reactflow.dev/"),cc=({nodes:e,edges:t,defaultNodes:n,defaultEdges:o,width:r,height:i,fitView:s,fitViewOptions:a,minZoom:c=.5,maxZoom:l=2,nodeOrigin:u,nodeExtent:f,zIndexMode:d="basic"}={})=>{let h=new Map,p=new Map,v=new Map,x=new Map,m=o??t??[],b=n??e??[],g=u??[0,0],w=f??St;sr(v,x,m);let{nodesInitialized:C}=ro(b,h,p,{nodeOrigin:g,nodeExtent:w,zIndexMode:d}),E=[0,0,1];if(s&&r&&i){let M=ht(h,{filter:T=>!!((T.width||T.initialWidth)&&(T.height||T.initialHeight))}),{x:A,y:P,zoom:V}=Mt(M,r,i,c,l,a?.padding??.1);E=[A,P,V]}return{rfId:"1",width:r??0,height:i??0,transform:E,nodes:b,nodesInitialized:C,nodeLookup:h,parentLookup:p,edges:m,edgeLookup:x,connectionLookup:v,onNodesChange:null,onEdgesChange:null,hasDefaultNodes:n!==void 0,hasDefaultEdges:o!==void 0,panZoom:null,minZoom:c,maxZoom:l,translateExtent:St,nodeExtent:w,nodesSelectionActive:!1,userSelectionActive:!1,userSelectionRect:null,connectionMode:Le.Strict,domNode:null,paneDragging:!1,noPanClassName:"nopan",nodeOrigin:g,nodeDragThreshold:1,connectionDragThreshold:1,snapGrid:[15,15],snapToGrid:!1,nodesDraggable:!0,nodesConnectable:!0,nodesFocusable:!0,edgesFocusable:!0,edgesReconnectable:!0,elementsSelectable:!0,elevateNodesOnSelect:!0,elevateEdgesOnSelect:!0,selectNodesOnDrag:!0,multiSelectionActive:!1,fitViewQueued:s??!1,fitViewOptions:a,fitViewResolver:null,connection:{...Vo},connectionClickStartHandle:null,connectOnClick:!0,ariaLiveMessage:"",autoPanOnConnect:!0,autoPanOnNodeDrag:!0,autoPanOnNodeFocus:!0,autoPanSpeed:15,connectionRadius:20,onError:og,isValidConnection:void 0,onSelectionChangeHandlers:[],lib:"react",debug:!1,ariaLabelConfig:Bo,zIndexMode:d,defaultEdgeOptions:void 0,onNodesChangeMiddlewareMap:new Map,onEdgesChangeMiddlewareMap:new Map,onNodesDelete:void 0,onEdgesDelete:void 0,onDelete:void 0,onBeforeDelete:void 0,onViewportChangeStart:void 0,onViewportChange:void 0,onViewportChangeEnd:void 0,onNodeDragStart:void 0,onNodeDrag:void 0,onNodeDragStop:void 0,onSelectionDragStart:void 0,onSelectionDrag:void 0,onSelectionDragStop:void 0,onMoveStart:void 0,onMove:void 0,onMoveEnd:void 0,onConnect:void 0,onConnectStart:void 0,onConnectEnd:void 0,onClickConnectStart:void 0,onClickConnectEnd:void 0}},rg=({nodes:e,edges:t,defaultNodes:n,defaultEdges:o,width:r,height:i,fitView:s,fitViewOptions:a,minZoom:c,maxZoom:l,nodeOrigin:u,nodeExtent:f,zIndexMode:d})=>Da((h,p)=>{async function v(){let{nodeLookup:x,panZoom:m,fitViewOptions:b,fitViewResolver:g,width:w,height:C,minZoom:E,maxZoom:M}=p();m&&(await Rs({nodes:x,width:w,height:C,panZoom:m,minZoom:E,maxZoom:M},b),g?.resolve(!0),h({fitViewResolver:null}))}return{...cc({nodes:e,edges:t,width:r,height:i,fitView:s,fitViewOptions:a,minZoom:c,maxZoom:l,nodeOrigin:u,nodeExtent:f,defaultNodes:n,defaultEdges:o,zIndexMode:d}),setNodes:x=>{let{nodeLookup:m,parentLookup:b,nodeOrigin:g,nodeExtent:w,elevateNodesOnSelect:C,fitViewQueued:E,zIndexMode:M,nodesSelectionActive:A}=p(),{nodesInitialized:P,hasSelectedNodes:V}=ro(x,m,b,{nodeOrigin:g,nodeExtent:w,elevateNodesOnSelect:C,checkEquality:!0,zIndexMode:M}),T=A&&V;E&&P?(v(),h({nodes:x,nodesInitialized:P,fitViewQueued:!1,fitViewOptions:void 0,nodesSelectionActive:T})):h({nodes:x,nodesInitialized:P,nodesSelectionActive:T})},setEdges:x=>{let{connectionLookup:m,edgeLookup:b}=p();sr(m,b,x),h({edges:x})},setDefaultNodesAndEdges:(x,m)=>{if(x){let{setNodes:b}=p();b(x),h({hasDefaultNodes:!0})}if(m){let{setEdges:b}=p();b(m),h({hasDefaultEdges:!0})}},updateNodeInternals:x=>{let{triggerNodeChanges:m,nodeLookup:b,parentLookup:g,domNode:w,nodeOrigin:C,nodeExtent:E,debug:M,fitViewQueued:A,zIndexMode:P}=p(),{changes:V,updatedInternals:T}=ta(x,b,g,w,C,E,P);T&&(js(b,g,{nodeOrigin:C,nodeExtent:E,zIndexMode:P}),A?(v(),h({fitViewQueued:!1,fitViewOptions:void 0})):h({}),V?.length>0&&(M&&console.log("React Flow: trigger node changes",V),m?.(V)))},updateNodePositions:(x,m=!1)=>{let b=[],g=[],{nodeLookup:w,triggerNodeChanges:C,connection:E,updateConnection:M,onNodesChangeMiddlewareMap:A}=p();for(let[P,V]of x){let T=w.get(P),H=!!(T?.expandParent&&T?.parentId&&V?.position),$={id:P,type:"position",position:H?{x:Math.max(0,V.position.x),y:Math.max(0,V.position.y)}:V.position,dragging:m};if(T&&E.inProgress&&E.fromNode.id===T.id){let y=Ge(T,E.fromHandle,Y.Left,!0);M({...E,from:y})}H&&T.parentId&&b.push({id:P,parentId:T.parentId,rect:{...V.internals.positionAbsolute,width:V.measured.width??0,height:V.measured.height??0}}),g.push($)}if(b.length>0){let{parentLookup:P,nodeOrigin:V}=p(),T=io(b,w,P,V);g.push(...T)}for(let P of A.values())g=P(g);C(g)},triggerNodeChanges:x=>{let{onNodesChange:m,setNodes:b,nodes:g,hasDefaultNodes:w,debug:C}=p();if(x?.length){if(w){let E=pr(x,g);b(E)}C&&console.log("React Flow: trigger node changes",x),m?.(x)}},triggerEdgeChanges:x=>{let{onEdgesChange:m,setEdges:b,edges:g,hasDefaultEdges:w,debug:C}=p();if(x?.length){if(w){let E=gr(x,g);b(E)}C&&console.log("React Flow: trigger edge changes",x),m?.(x)}},addSelectedNodes:x=>{let{multiSelectionActive:m,edgeLookup:b,nodeLookup:g,triggerNodeChanges:w,triggerEdgeChanges:C}=p();if(m){let E=x.map(M=>pt(M,!0));w(E);return}w(At(g,new Set([...x]),!0)),C(At(b))},addSelectedEdges:x=>{let{multiSelectionActive:m,edgeLookup:b,nodeLookup:g,triggerNodeChanges:w,triggerEdgeChanges:C}=p();if(m){let E=x.map(M=>pt(M,!0));C(E);return}C(At(b,new Set([...x]))),w(At(g,new Set,!0))},unselectNodesAndEdges:({nodes:x,edges:m}={})=>{let{edges:b,nodes:g,nodeLookup:w,triggerNodeChanges:C,triggerEdgeChanges:E}=p(),M=x||g,A=m||b,P=[];for(let T of M){if(!T.selected)continue;let H=w.get(T.id);H&&(H.selected=!1),P.push(pt(T.id,!1))}let V=[];for(let T of A)T.selected&&V.push(pt(T.id,!1));C(P),E(V)},setMinZoom:x=>{let{panZoom:m,maxZoom:b}=p();m?.setScaleExtent([x,b]),h({minZoom:x})},setMaxZoom:x=>{let{panZoom:m,minZoom:b}=p();m?.setScaleExtent([b,x]),h({maxZoom:x})},setTranslateExtent:x=>{p().panZoom?.setTranslateExtent(x),h({translateExtent:x})},resetSelectedElements:()=>{let{edges:x,nodes:m,triggerNodeChanges:b,triggerEdgeChanges:g,elementsSelectable:w}=p();if(!w)return;let C=m.reduce((M,A)=>A.selected?[...M,pt(A.id,!1)]:M,[]),E=x.reduce((M,A)=>A.selected?[...M,pt(A.id,!1)]:M,[]);b(C),g(E)},setNodeExtent:x=>{let{nodes:m,nodeLookup:b,parentLookup:g,nodeOrigin:w,elevateNodesOnSelect:C,nodeExtent:E,zIndexMode:M}=p();x[0][0]===E[0][0]&&x[0][1]===E[0][1]&&x[1][0]===E[1][0]&&x[1][1]===E[1][1]||(ro(m,b,g,{nodeOrigin:w,nodeExtent:x,elevateNodesOnSelect:C,checkEquality:!1,zIndexMode:M}),h({nodeExtent:x}))},panBy:x=>{let{transform:m,width:b,height:g,panZoom:w,translateExtent:C}=p();return na({delta:x,panZoom:w,transform:m,translateExtent:C,width:b,height:g})},setCenter:async(x,m,b)=>{let{width:g,height:w,maxZoom:C,panZoom:E}=p();if(!E)return!1;let M=typeof b?.zoom<"u"?b.zoom:C;return await E.setViewport({x:g/2-x*M,y:w/2-m*M,zoom:M},{duration:b?.duration,ease:b?.ease,interpolate:b?.interpolate}),!0},cancelConnection:()=>{h({connection:{...Vo}})},updateConnection:x=>{h({connection:x})},reset:()=>h({...cc()})}},Object.is);function qc({initialNodes:e,initialEdges:t,defaultNodes:n,defaultEdges:o,initialWidth:r,initialHeight:i,initialMinZoom:s,initialMaxZoom:a,initialFitViewOptions:c,fitView:l,nodeOrigin:u,nodeExtent:f,zIndexMode:d,children:h}){let[p]=(0,_.useState)(()=>rg({nodes:e,edges:t,defaultNodes:n,defaultEdges:o,width:r,height:i,fitView:l,minZoom:s,maxZoom:a,fitViewOptions:c,nodeOrigin:u,nodeExtent:f,zIndexMode:d}));return(0,k.jsx)(Ih,{value:p,children:(0,k.jsx)(Uh,{children:(0,k.jsx)(dp,{children:h})})})}function ig({children:e,nodes:t,edges:n,defaultNodes:o,defaultEdges:r,width:i,height:s,fitView:a,fitViewOptions:c,minZoom:l,maxZoom:u,nodeOrigin:f,nodeExtent:d,zIndexMode:h}){return(0,_.useContext)(po)?(0,k.jsx)(k.Fragment,{children:e}):(0,k.jsx)(qc,{initialNodes:t,initialEdges:n,defaultNodes:o,defaultEdges:r,initialWidth:i,initialHeight:s,fitView:a,initialFitViewOptions:c,initialMinZoom:l,initialMaxZoom:u,nodeOrigin:f,nodeExtent:d,zIndexMode:h,children:e})}var sg={width:"100%",height:"100%",overflow:"hidden",position:"relative",zIndex:0};function ag({nodes:e,edges:t,defaultNodes:n,defaultEdges:o,className:r,nodeTypes:i,edgeTypes:s,onNodeClick:a,onEdgeClick:c,onInit:l,onMove:u,onMoveStart:f,onMoveEnd:d,onConnect:h,onConnectStart:p,onConnectEnd:v,onClickConnectStart:x,onClickConnectEnd:m,onNodeMouseEnter:b,onNodeMouseMove:g,onNodeMouseLeave:w,onNodeContextMenu:C,onNodeDoubleClick:E,onNodeDragStart:M,onNodeDrag:A,onNodeDragStop:P,onNodesDelete:V,onEdgesDelete:T,onDelete:H,onSelectionChange:$,onSelectionDragStart:y,onSelectionDrag:S,onSelectionDragStop:N,onSelectionContextMenu:I,onSelectionStart:D,onSelectionEnd:O,onBeforeDelete:R,connectionMode:B,connectionLineType:L=Ce.Bezier,connectionLineStyle:Z,connectionLineComponent:F,connectionLineContainerStyle:G,deleteKeyCode:j="Backspace",selectionKeyCode:q="Shift",selectionOnDrag:z=!1,selectionMode:X=qe.Full,panActivationKeyCode:J="Space",multiSelectionKeyCode:Q=It()?"Meta":"Control",zoomActivationKeyCode:W=It()?"Meta":"Control",snapToGrid:U,snapGrid:ee,onlyRenderVisibleElements:te=!1,selectNodesOnDrag:re,nodesDraggable:le,autoPanOnNodeFocus:Ae,nodesConnectable:Ne,nodesFocusable:Me,nodeOrigin:De=hc,edgesFocusable:Tt,edgesReconnectable:Ue,elementsSelectable:Qe=!0,defaultViewport:be=Vh,minZoom:Oe=.5,maxZoom:Te=2,translateExtent:Je=St,preventScrolling:yo=!0,nodeExtent:xo,defaultMarkerColor:jc="#b1b1b7",zoomOnScroll:el=!0,zoomOnPinch:tl=!0,panOnScroll:nl=!1,panOnScrollSpeed:ol=.5,panOnScrollMode:rl=ke.Free,zoomOnDoubleClick:il=!0,panOnDrag:sl=!0,onPaneClick:al,onPaneMouseEnter:cl,onPaneMouseMove:ll,onPaneMouseLeave:ul,onPaneScroll:dl,onPaneContextMenu:fl,paneClickDistance:hl=1,nodeClickDistance:pl=0,children:gl,onReconnect:ml,onReconnectStart:yl,onReconnectEnd:xl,onEdgeContextMenu:wl,onEdgeDoubleClick:vl,onEdgeMouseEnter:bl,onEdgeMouseMove:El,onEdgeMouseLeave:Sl,reconnectRadius:_l=10,onNodesChange:Cl,onEdgesChange:Nl,noDragClassName:Ml="nodrag",noWheelClassName:Il="nowheel",noPanClassName:wr="nopan",fitView:vr,fitViewOptions:br,connectOnClick:kl,attributionPosition:Pl,proOptions:Al,defaultEdgeOptions:Dl,elevateNodesOnSelect:Ol=!0,elevateEdgesOnSelect:Tl=!1,disableKeyboardA11y:Er=!1,autoPanOnConnect:zl,autoPanOnNodeDrag:$l,autoPanOnSelection:Rl=!0,autoPanSpeed:Hl,connectionRadius:Ll,isValidConnection:Bl,onError:Vl,style:Fl,id:Sr,nodeDragThreshold:Xl,connectionDragThreshold:Yl,viewport:Zl,onViewportChange:Wl,width:ql,height:Gl,colorMode:Kl="light",debug:Ul,onScroll:_r,ariaLabelConfig:Ql,zIndexMode:Cr="basic",...Jl},jl){let wo=Sr||"1",eu=Zh(Kl),tu=(0,_.useCallback)(Nr=>{Nr.currentTarget.scrollTo({top:0,left:0,behavior:"instant"}),_r?.(Nr)},[_r]);return(0,k.jsx)("div",{"data-testid":"rf__wrapper",...Jl,onScroll:tu,style:{...Fl,...sg},ref:jl,className:ie(["react-flow",r,eu]),id:Sr,role:"application",children:(0,k.jsxs)(ig,{nodes:e,edges:t,width:ql,height:Gl,fitView:vr,fitViewOptions:br,minZoom:Oe,maxZoom:Te,nodeOrigin:De,nodeExtent:xo,zIndexMode:Cr,children:[(0,k.jsx)(Yh,{nodes:e,edges:t,defaultNodes:n,defaultEdges:o,onConnect:h,onConnectStart:p,onConnectEnd:v,onClickConnectStart:x,onClickConnectEnd:m,nodesDraggable:le,autoPanOnNodeFocus:Ae,nodesConnectable:Ne,nodesFocusable:Me,edgesFocusable:Tt,edgesReconnectable:Ue,elementsSelectable:Qe,elevateNodesOnSelect:Ol,elevateEdgesOnSelect:Tl,minZoom:Oe,maxZoom:Te,nodeExtent:xo,onNodesChange:Cl,onEdgesChange:Nl,snapToGrid:U,snapGrid:ee,connectionMode:B,translateExtent:Je,connectOnClick:kl,defaultEdgeOptions:Dl,fitView:vr,fitViewOptions:br,onNodesDelete:V,onEdgesDelete:T,onDelete:H,onNodeDragStart:M,onNodeDrag:A,onNodeDragStop:P,onSelectionDrag:S,onSelectionDragStart:y,onSelectionDragStop:N,onMove:u,onMoveStart:f,onMoveEnd:d,noPanClassName:wr,nodeOrigin:De,rfId:wo,autoPanOnConnect:zl,autoPanOnNodeDrag:$l,autoPanSpeed:Hl,onError:Vl,connectionRadius:Ll,isValidConnection:Bl,selectNodesOnDrag:re,nodeDragThreshold:Xl,connectionDragThreshold:Yl,onBeforeDelete:R,debug:Ul,ariaLabelConfig:Ql,zIndexMode:Cr}),(0,k.jsx)(ng,{onInit:l,onNodeClick:a,onEdgeClick:c,onNodeMouseEnter:b,onNodeMouseMove:g,onNodeMouseLeave:w,onNodeContextMenu:C,onNodeDoubleClick:E,nodeTypes:i,edgeTypes:s,connectionLineType:L,connectionLineStyle:Z,connectionLineComponent:F,connectionLineContainerStyle:G,selectionKeyCode:q,selectionOnDrag:z,selectionMode:X,deleteKeyCode:j,multiSelectionKeyCode:Q,panActivationKeyCode:J,zoomActivationKeyCode:W,onlyRenderVisibleElements:te,defaultViewport:be,translateExtent:Je,minZoom:Oe,maxZoom:Te,preventScrolling:yo,zoomOnScroll:el,zoomOnPinch:tl,zoomOnDoubleClick:il,panOnScroll:nl,panOnScrollSpeed:ol,panOnScrollMode:rl,panOnDrag:sl,autoPanOnSelection:Rl,onPaneClick:al,onPaneMouseEnter:cl,onPaneMouseMove:ll,onPaneMouseLeave:ul,onPaneScroll:dl,onPaneContextMenu:fl,paneClickDistance:hl,nodeClickDistance:pl,onSelectionContextMenu:I,onSelectionStart:D,onSelectionEnd:O,onReconnect:ml,onReconnectStart:yl,onReconnectEnd:xl,onEdgeContextMenu:wl,onEdgeDoubleClick:vl,onEdgeMouseEnter:bl,onEdgeMouseMove:El,onEdgeMouseLeave:Sl,reconnectRadius:_l,defaultMarkerColor:jc,noDragClassName:Ml,noWheelClassName:Il,noPanClassName:wr,rfId:wo,disableKeyboardA11y:Er,nodeExtent:xo,viewport:Zl,onViewportChange:Wl,nodesDraggable:le}),(0,k.jsx)(Bh,{onSelectionChange:$}),gl,(0,k.jsx)(zh,{proOptions:Al,position:Pl}),(0,k.jsx)(Th,{rfId:wo,disableKeyboardA11y:Er})]})})}var cg=xc(ag),lg=e=>e.domNode?.querySelector(".react-flow__edgelabel-renderer");function Gc({children:e}){let t=K(lg);return t?(0,ho.createPortal)(e,t):null}var ug=e=>e.domNode?.querySelector(".react-flow__viewport-portal");function dg({children:e}){let t=K(ug);return t?(0,ho.createPortal)(e,t):null}function fg(){let e=ne();return(0,_.useCallback)(t=>{let{domNode:n,updateNodeInternals:o}=e.getState(),r=Array.isArray(t)?t:[t],i=new Map;r.forEach(s=>{let a=n?.querySelector(`.react-flow__node[data-id="${s}"]`);a&&i.set(s,{id:s,nodeElement:a,force:!0})}),requestAnimationFrame(()=>o(i,{triggerFitView:!1}))},[])}var hg=e=>e.nodes;function pg(){return K(hg,oe)}var gg=e=>e.edges;function mg(){return K(gg,oe)}var yg=e=>({x:e.transform[0],y:e.transform[1],zoom:e.transform[2]});function xg(){return K(yg,oe)}function wg(e){let[t,n]=(0,_.useState)(e),o=(0,_.useCallback)(r=>n(i=>pr(r,i)),[]);return[t,n,o]}function vg(e){let[t,n]=(0,_.useState)(e),o=(0,_.useCallback)(r=>n(i=>gr(r,i)),[]);return[t,n,o]}function bg({onStart:e,onChange:t,onEnd:n}){let o=ne();(0,_.useEffect)(()=>{o.setState({onViewportChangeStart:e})},[e]),(0,_.useEffect)(()=>{o.setState({onViewportChange:t})},[t]),(0,_.useEffect)(()=>{o.setState({onViewportChangeEnd:n})},[n])}function Eg({onChange:e}){let t=ne();(0,_.useEffect)(()=>{let n=[...t.getState().onSelectionChangeHandlers,e];return t.setState({onSelectionChangeHandlers:n}),()=>{let o=t.getState().onSelectionChangeHandlers.filter(r=>r!==e);t.setState({onSelectionChangeHandlers:o})}},[e])}var Sg=e=>t=>{if(!e.includeHiddenNodes)return t.nodesInitialized;if(t.nodeLookup.size===0)return!1;for(let[,{internals:n}]of t.nodeLookup)if(n.handleBounds===void 0||!eo(n.userNode))return!1;return!0};function _g(e={includeHiddenNodes:!1}){return K(Sg(e))}function Cg({type:e,id:t,nodeId:n,onConnect:o,onDisconnect:r}){console.warn("[DEPRECATED] `useHandleConnections` is deprecated. Instead use `useNodeConnections` https://reactflow.dev/api-reference/hooks/useNodeConnections");let i=Ot(),s=n??i,a=(0,_.useRef)(null),c=K(l=>l.connectionLookup.get(`${s}-${e}${t?`-${t}`:""}`),Qo);return(0,_.useEffect)(()=>{if(a.current&&a.current!==c){let l=c??new Map;an(a.current,l,r),an(l,a.current,o)}a.current=c??new Map},[c,o,r]),(0,_.useMemo)(()=>Array.from(c?.values()??[]),[c])}var Ng=ge.error014();function Mg({id:e,handleType:t,handleId:n,onConnect:o,onDisconnect:r}={}){let i=Ot(),s=e??i;if(!s)throw new Error(Ng);let a=(0,_.useRef)(null),c=K(l=>l.connectionLookup.get(`${s}${t?n?`-${t}-${n}`:`-${t}`:""}`),Qo);return(0,_.useEffect)(()=>{if(a.current&&a.current!==c){let l=c??new Map;an(a.current,l,r),an(l,a.current,o)}a.current=c??new Map},[c,o,r]),(0,_.useMemo)(()=>Array.from(c?.values()??[]),[c])}function Ig(e){return K((0,_.useCallback)(n=>{let o=[],r=Array.isArray(e),i=r?e:[e];for(let s of i){let a=n.nodeLookup.get(s);a&&o.push({id:a.id,type:a.type,data:a.data})}return r?o:o[0]??null},[e]),oa)}function kg(e){return K((0,_.useCallback)(n=>n.nodeLookup.get(e),[e]),oe)}function Pg(e){let t=ne(),[n]=(0,_.useState)(()=>Symbol());(0,_.useEffect)(()=>{let{onNodesChangeMiddlewareMap:o}=t.getState();o.set(n,e)},[e]),(0,_.useEffect)(()=>{let{onNodesChangeMiddlewareMap:o}=t.getState();return()=>{o.delete(n)}},[])}function Ag(e){let t=ne(),[n]=(0,_.useState)(()=>Symbol());(0,_.useEffect)(()=>{let{onEdgesChangeMiddlewareMap:o}=t.getState();o.set(n,e)},[e]),(0,_.useEffect)(()=>{let{onEdgesChangeMiddlewareMap:o}=t.getState();return()=>{o.delete(n)}},[])}function Dg({dimensions:e,lineWidth:t,variant:n,className:o}){return(0,k.jsx)("path",{strokeWidth:t,d:`M${e[0]/2} 0 V${e[1]} M0 ${e[1]/2} H${e[0]}`,className:ie(["react-flow__background-pattern",n,o])})}function Og({radius:e,className:t}){return(0,k.jsx)("circle",{cx:e,cy:e,r:e,className:ie(["react-flow__background-pattern","dots",t])})}var Be;(function(e){e.Lines="lines",e.Dots="dots",e.Cross="cross"})(Be||(Be={}));var Tg={[Be.Dots]:1,[Be.Lines]:1,[Be.Cross]:6},zg=e=>({transform:e.transform,patternId:`pattern-${e.rfId}`});function Kc({id:e,variant:t=Be.Dots,gap:n=20,size:o,lineWidth:r=1,offset:i=0,color:s,bgColor:a,style:c,className:l,patternClassName:u}){let f=(0,_.useRef)(null),{transform:d,patternId:h}=K(zg,oe),p=o||Tg[t],v=t===Be.Dots,x=t===Be.Cross,m=Array.isArray(n)?n:[n,n],b=[m[0]*d[2]||1,m[1]*d[2]||1],g=p*d[2],w=Array.isArray(i)?i:[i,i],C=x?[g,g]:b,E=[w[0]*d[2]+C[0]/2,w[1]*d[2]+C[1]/2],M=`${h}${e||""}`;return(0,k.jsxs)("svg",{className:ie(["react-flow__background",l]),style:{...c,...mo,"--xy-background-color-props":a,"--xy-background-pattern-color-props":s},ref:f,"data-testid":"rf__background",children:[(0,k.jsx)("pattern",{id:M,x:d[0]%b[0],y:d[1]%b[1],width:b[0],height:b[1],patternUnits:"userSpaceOnUse",patternTransform:`translate(-${E[0]},-${E[1]})`,children:v?(0,k.jsx)(Og,{radius:g/2,className:u}):(0,k.jsx)(Dg,{dimensions:C,lineWidth:r,variant:t,className:u})}),(0,k.jsx)("rect",{x:"0",y:"0",width:"100%",height:"100%",fill:`url(#${M})`})]})}Kc.displayName="Background";var $g=(0,_.memo)(Kc);function Rg(){return(0,k.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32",children:(0,k.jsx)("path",{d:"M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"})})}function Hg(){return(0,k.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 5",children:(0,k.jsx)("path",{d:"M0 0h32v4.2H0z"})})}function Lg(){return(0,k.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 30",children:(0,k.jsx)("path",{d:"M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"})})}function Bg(){return(0,k.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 25 32",children:(0,k.jsx)("path",{d:"M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"})})}function Vg(){return(0,k.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 25 32",children:(0,k.jsx)("path",{d:"M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"})})}function fn({children:e,className:t,...n}){return(0,k.jsx)("button",{type:"button",className:ie(["react-flow__controls-button",t]),...n,children:e})}var Fg=e=>({isInteractive:e.nodesDraggable||e.nodesConnectable||e.elementsSelectable,minZoomReached:e.transform[2]<=e.minZoom,maxZoomReached:e.transform[2]>=e.maxZoom,ariaLabelConfig:e.ariaLabelConfig});function Uc({style:e,showZoom:t=!0,showFitView:n=!0,showInteractive:o=!0,fitViewOptions:r,onZoomIn:i,onZoomOut:s,onFitView:a,onInteractiveChange:c,className:l,children:u,position:f="bottom-left",orientation:d="vertical","aria-label":h}){let p=ne(),{isInteractive:v,minZoomReached:x,maxZoomReached:m,ariaLabelConfig:b}=K(Fg,oe),{zoomIn:g,zoomOut:w,fitView:C}=go(),E=()=>{g(),i?.()},M=()=>{w(),s?.()},A=()=>{C(r),a?.()},P=()=>{p.setState({nodesDraggable:!v,nodesConnectable:!v,elementsSelectable:!v}),c?.(!v)};return(0,k.jsxs)(pn,{className:ie(["react-flow__controls",d==="horizontal"?"horizontal":"vertical",l]),position:f,style:e,"data-testid":"rf__controls","aria-label":h??b["controls.ariaLabel"],children:[t&&(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(fn,{onClick:E,className:"react-flow__controls-zoomin",title:b["controls.zoomIn.ariaLabel"],"aria-label":b["controls.zoomIn.ariaLabel"],disabled:m,children:(0,k.jsx)(Rg,{})}),(0,k.jsx)(fn,{onClick:M,className:"react-flow__controls-zoomout",title:b["controls.zoomOut.ariaLabel"],"aria-label":b["controls.zoomOut.ariaLabel"],disabled:x,children:(0,k.jsx)(Hg,{})})]}),n&&(0,k.jsx)(fn,{className:"react-flow__controls-fitview",onClick:A,title:b["controls.fitView.ariaLabel"],"aria-label":b["controls.fitView.ariaLabel"],children:(0,k.jsx)(Lg,{})}),o&&(0,k.jsx)(fn,{className:"react-flow__controls-interactive",onClick:P,title:b["controls.interactive.ariaLabel"],"aria-label":b["controls.interactive.ariaLabel"],children:v?(0,k.jsx)(Vg,{}):(0,k.jsx)(Bg,{})}),u]})}Uc.displayName="Controls";var Xg=(0,_.memo)(Uc);function Yg({id:e,x:t,y:n,width:o,height:r,style:i,color:s,strokeColor:a,strokeWidth:c,className:l,borderRadius:u,shapeRendering:f,selected:d,onClick:h}){let{background:p,backgroundColor:v}=i||{},x=s||p||v;return(0,k.jsx)("rect",{className:ie(["react-flow__minimap-node",{selected:d},l]),x:t,y:n,rx:u,ry:u,width:o,height:r,style:{fill:x,stroke:a,strokeWidth:c},shapeRendering:f,onClick:h?m=>h(m,e):void 0})}var Qc=(0,_.memo)(Yg),Zg=e=>e.nodes.map(t=>t.id),ur=e=>e instanceof Function?e:()=>e;function Wg({nodeStrokeColor:e,nodeColor:t,nodeClassName:n="",nodeBorderRadius:o=5,nodeStrokeWidth:r,nodeComponent:i=Qc,onClick:s}){let a=K(Zg,oe),c=ur(t),l=ur(e),u=ur(n),f=typeof window>"u"||window.chrome?"crispEdges":"geometricPrecision";return(0,k.jsx)(k.Fragment,{children:a.map(d=>(0,k.jsx)(Gg,{id:d,nodeColorFunc:c,nodeStrokeColorFunc:l,nodeClassNameFunc:u,nodeBorderRadius:o,nodeStrokeWidth:r,NodeComponent:i,onClick:s,shapeRendering:f},d))})}function qg({id:e,nodeColorFunc:t,nodeStrokeColorFunc:n,nodeClassNameFunc:o,nodeBorderRadius:r,nodeStrokeWidth:i,shapeRendering:s,NodeComponent:a,onClick:c}){let{node:l,x:u,y:f,width:d,height:h}=K(p=>{let v=p.nodeLookup.get(e);if(!v)return{node:void 0,x:0,y:0,width:0,height:0};let x=v.internals.userNode,{x:m,y:b}=v.internals.positionAbsolute,{width:g,height:w}=ve(x);return{node:x,x:m,y:b,width:g,height:w}},oe);return!l||l.hidden||!eo(l)?null:(0,k.jsx)(a,{x:u,y:f,width:d,height:h,style:l.style,selected:!!l.selected,className:o(l),color:t(l),borderRadius:r,strokeColor:n(l),strokeWidth:i,shapeRendering:s,onClick:c,id:l.id})}var Gg=(0,_.memo)(qg),Kg=(0,_.memo)(Wg),Ug=200,Qg=150,Jg=e=>!e.hidden,jg=e=>{let t={x:-e.transform[0]/e.transform[2],y:-e.transform[1]/e.transform[2],width:e.width/e.transform[2],height:e.height/e.transform[2]},n=!1;for(let o of e.nodeLookup.values())if(!o.hidden){n=!0;break}return{viewBB:t,boundingRect:n?Wo(ht(e.nodeLookup,{filter:Jg}),t):t,rfId:e.rfId,panZoom:e.panZoom,translateExtent:e.translateExtent,flowWidth:e.width,flowHeight:e.height,ariaLabelConfig:e.ariaLabelConfig}},lc=(e,t)=>e.x===t.x&&e.y===t.y&&e.width===t.width&&e.height===t.height,em=(e,t)=>lc(e.viewBB,t.viewBB)&&lc(e.boundingRect,t.boundingRect)&&e.rfId===t.rfId&&e.panZoom===t.panZoom&&e.translateExtent===t.translateExtent&&e.flowWidth===t.flowWidth&&e.flowHeight===t.flowHeight&&e.ariaLabelConfig===t.ariaLabelConfig,tm="react-flow__minimap-desc";function Jc({style:e,className:t,nodeStrokeColor:n,nodeColor:o,nodeClassName:r="",nodeBorderRadius:i=5,nodeStrokeWidth:s,nodeComponent:a,bgColor:c,maskColor:l,maskStrokeColor:u,maskStrokeWidth:f,position:d="bottom-right",onClick:h,onNodeClick:p,pannable:v=!1,zoomable:x=!1,ariaLabel:m,inversePan:b,zoomStep:g=1,offsetScale:w=5}){let C=ne(),E=(0,_.useRef)(null),{boundingRect:M,panZoom:A,viewBB:P,rfId:V,translateExtent:T,flowWidth:H,flowHeight:$,ariaLabelConfig:y}=K(jg,em),S=e?.width??Ug,N=e?.height??Qg,I=M.width/S,D=M.height/N,O=Math.max(I,D),R=O*S,B=O*N,L=w*O,Z=M.x-(R-M.width)/2-L,F=M.y-(B-M.height)/2-L,G=R+L*2,j=B+L*2,q=`${tm}-${V}`,z=(0,_.useRef)(0),X=(0,_.useRef)();z.current=O,(0,_.useEffect)(()=>{let ee=C.getState().panZoom;if(E.current&&ee)return X.current=ua({domNode:E.current,panZoom:ee,getTransform:()=>C.getState().transform,getViewScale:()=>z.current}),()=>{X.current?.destroy()}},[A]),(0,_.useEffect)(()=>{X.current?.update({translateExtent:T,width:H,height:$,inversePan:b,pannable:v,zoomStep:g,zoomable:x})},[v,x,b,g,T,H,$]);let J=h?ee=>{let[te,re]=X.current?.pointer(ee)||[0,0];h(ee,{x:te,y:re})}:void 0,Q=(0,_.useCallback)((ee,te)=>{let re=C.getState().nodeLookup.get(te).internals.userNode;p?.(ee,re)},[p]),W=p?Q:void 0,U=m??y["minimap.ariaLabel"];return(0,k.jsx)(pn,{position:d,style:{...e,"--xy-minimap-background-color-props":typeof c=="string"?c:void 0,"--xy-minimap-mask-background-color-props":typeof l=="string"?l:void 0,"--xy-minimap-mask-stroke-color-props":typeof u=="string"?u:void 0,"--xy-minimap-mask-stroke-width-props":typeof f=="number"?f*O:void 0,"--xy-minimap-node-background-color-props":typeof o=="string"?o:void 0,"--xy-minimap-node-stroke-color-props":typeof n=="string"?n:void 0,"--xy-minimap-node-stroke-width-props":typeof s=="number"?s:void 0},className:ie(["react-flow__minimap",t]),"data-testid":"rf__minimap",children:(0,k.jsxs)("svg",{width:S,height:N,viewBox:`${Z} ${F} ${G} ${j}`,className:"react-flow__minimap-svg",role:"img","aria-labelledby":q,ref:E,onClick:J,children:[U&&(0,k.jsx)("title",{id:q,children:U}),(0,k.jsx)(Kg,{onClick:W,nodeColor:o,nodeStrokeColor:n,nodeBorderRadius:i,nodeClassName:r,nodeStrokeWidth:s,nodeComponent:a}),(0,k.jsx)("path",{className:"react-flow__minimap-mask",d:`M${Z-L},${F-L}h${G+L*2}v${j+L*2}h${-G-L*2}z
        M${P.x},${P.y}h${P.width}v${P.height}h${-P.width}z`,fillRule:"evenodd",pointerEvents:"none"})]})})}Jc.displayName="MiniMap";var nm=(0,_.memo)(Jc),om=e=>t=>e?`${Math.max(1/t.transform[2],1)}`:void 0,rm={[Pe.Line]:"right",[Pe.Handle]:"bottom-right"};function im({nodeId:e,position:t,variant:n=Pe.Handle,className:o,style:r=void 0,children:i,color:s,minWidth:a=10,minHeight:c=10,maxWidth:l=Number.MAX_VALUE,maxHeight:u=Number.MAX_VALUE,keepAspectRatio:f=!1,resizeDirection:d,autoScale:h=!0,shouldResize:p,onResizeStart:v,onResize:x,onResizeEnd:m}){let b=Ot(),g=typeof e=="string"?e:b,w=ne(),C=(0,_.useRef)(null),E=n===Pe.Handle,M=K((0,_.useCallback)(om(E&&h),[E,h]),oe),A=(0,_.useRef)(null),P=t??rm[n];(0,_.useEffect)(()=>{if(!(!C.current||!g))return A.current||(A.current=ya({domNode:C.current,nodeId:g,getStoreItems:()=>{let{nodeLookup:T,transform:H,snapGrid:$,snapToGrid:y,nodeOrigin:S,domNode:N}=w.getState();return{nodeLookup:T,transform:H,snapGrid:$,snapToGrid:y,nodeOrigin:S,paneDomNode:N}},onChange:(T,H)=>{let{triggerNodeChanges:$,nodeLookup:y,parentLookup:S,nodeOrigin:N}=w.getState(),I=[],D={x:T.x,y:T.y},O=y.get(g);if(O&&O.expandParent&&O.parentId){let R=O.origin??N,B=T.width??O.measured.width??0,L=T.height??O.measured.height??0,Z={id:O.id,parentId:O.parentId,rect:{width:B,height:L,...Ko({x:T.x??O.position.x,y:T.y??O.position.y},{width:B,height:L},O.parentId,y,R)}},F=io([Z],y,S,N);I.push(...F),D.x=T.x?Math.max(R[0]*B,T.x):void 0,D.y=T.y?Math.max(R[1]*L,T.y):void 0}if(D.x!==void 0&&D.y!==void 0){let R={id:g,type:"position",position:{...D}};I.push(R)}if(T.width!==void 0&&T.height!==void 0){let B={id:g,type:"dimensions",resizing:!0,setAttributes:d?d==="horizontal"?"width":"height":!0,dimensions:{width:T.width,height:T.height}};I.push(B)}for(let R of H){let B={...R,type:"position"};I.push(B)}$(I)},onEnd:({width:T,height:H})=>{let $={id:g,type:"dimensions",resizing:!1,dimensions:{width:T,height:H}};w.getState().triggerNodeChanges([$])}})),A.current.update({controlPosition:P,boundaries:{minWidth:a,minHeight:c,maxWidth:l,maxHeight:u},keepAspectRatio:f,resizeDirection:d,onResizeStart:v,onResize:x,onResizeEnd:m,shouldResize:p}),()=>{A.current?.destroy()}},[P,a,c,l,u,f,v,x,m,p]);let V=P.split("-");return(0,k.jsx)("div",{className:ie(["react-flow__resize-control","nodrag",...V,n,o]),ref:C,style:{...r,scale:M,...s&&{[E?"backgroundColor":"borderColor"]:s}},children:i})}var hr=(0,_.memo)(im);function sm({nodeId:e,isVisible:t=!0,handleClassName:n,handleStyle:o,lineClassName:r,lineStyle:i,color:s,minWidth:a=10,minHeight:c=10,maxWidth:l=Number.MAX_VALUE,maxHeight:u=Number.MAX_VALUE,keepAspectRatio:f=!1,autoScale:d=!0,shouldResize:h,onResizeStart:p,onResize:v,onResizeEnd:x}){return t?(0,k.jsxs)(k.Fragment,{children:[ga.map(m=>(0,k.jsx)(hr,{className:r,style:i,nodeId:e,position:m,variant:Pe.Line,color:s,minWidth:a,minHeight:c,maxWidth:l,maxHeight:u,onResizeStart:p,keepAspectRatio:f,autoScale:d,shouldResize:h,onResize:v,onResizeEnd:x},m)),pa.map(m=>(0,k.jsx)(hr,{className:n,style:o,nodeId:e,position:m,color:s,minWidth:a,minHeight:c,maxWidth:l,maxHeight:u,onResizeStart:p,keepAspectRatio:f,autoScale:d,shouldResize:h,onResize:v,onResizeEnd:x},m))]}):null}var am=e=>e.domNode?.querySelector(".react-flow__renderer");function cm({children:e}){let t=K(am);return t?(0,ho.createPortal)(e,t):null}var lm=(e,t)=>e?.internals.positionAbsolute.x!==t?.internals.positionAbsolute.x||e?.internals.positionAbsolute.y!==t?.internals.positionAbsolute.y||e?.measured.width!==t?.measured.width||e?.measured.height!==t?.measured.height||e?.selected!==t?.selected||e?.internals.z!==t?.internals.z,um=(e,t)=>{if(e.size!==t.size)return!1;for(let[n,o]of e)if(lm(o,t.get(n)))return!1;return!0},dm=e=>({x:e.transform[0],y:e.transform[1],zoom:e.transform[2],selectedNodesCount:e.nodes.filter(t=>t.selected).length});function fm({nodeId:e,children:t,className:n,style:o,isVisible:r,position:i=Y.Top,offset:s=10,align:a="center",...c}){let l=Ot(),u=(0,_.useCallback)(C=>(Array.isArray(e)?e:[e||l||""]).reduce((A,P)=>{let V=C.nodeLookup.get(P);return V&&A.set(V.id,V),A},new Map),[e,l]),f=K(u,um),{x:d,y:h,zoom:p,selectedNodesCount:v}=K(dm,oe);if(!(typeof r=="boolean"?r:f.size===1&&f.values().next().value?.selected&&v===1)||!f.size)return null;let m=ht(f),b=Array.from(f.values()),g=Math.max(...b.map(C=>C.internals.z+1)),w={position:"absolute",transform:Us(m,{x:d,y:h,zoom:p},i,s,a),zIndex:g,...o};return(0,k.jsx)(cm,{children:(0,k.jsx)("div",{style:w,className:ie(["react-flow__node-toolbar",n]),...c,"data-id":b.reduce((C,E)=>`${C}${E.id} `,"").trim(),children:t})})}var hm=e=>e.transform[2];function pm({edgeId:e,x:t,y:n,children:o,className:r,style:i,isVisible:s,alignX:a="center",alignY:c="center",...l}){let u=(0,_.useCallback)(x=>x.edgeLookup.get(e),[e]),f=K(u,oe),d=typeof s=="boolean"?s:f?.selected,h=K(hm);if(!d)return null;let p=(f?.zIndex??0)+1,v=Qs(t,n,h,a,c);return(0,k.jsx)(Gc,{children:(0,k.jsx)("div",{style:{position:"absolute",transform:v,zIndex:p,pointerEvents:"all",transformOrigin:"0 0",...i},className:ie(["react-flow__edge-toolbar",r]),"data-id":f?.id??"",...l,children:o})})}
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.production.js:
  (**
   * @license React
   * use-sync-external-store-shim.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/

	return module.exports
}

/**
 * 这一文件由 tools/build-vendor.mjs 生成,**不要手改**。
 * graphology + graphology-layout-forceatlas2(0.10.1),声明成同一脚本作用域里的函数。
 * 力导向布局是知识图谱的原生形状来源;分层布局只认得父子关系,会把非层级的边压成横穿线。
 */
function __clearaiForce(require) {
	var module = { exports: {} }
	var exports = module.exports
var Wt=Object.create;var Le=Object.defineProperty;var Pt=Object.getOwnPropertyDescriptor;var xt=Object.getOwnPropertyNames;var Kt=Object.getPrototypeOf,Ft=Object.prototype.hasOwnProperty;var se=(i,t)=>()=>{try{return t||i((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}},Ht=(i,t)=>{for(var e in t)Le(i,e,{get:t[e],enumerable:!0})},Ze=(i,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of xt(t))!Ft.call(i,s)&&s!==e&&Le(i,s,{get:()=>t[s],enumerable:!(n=Pt(t,s))||n.enumerable});return i};var Je=(i,t,e)=>(e=i!=null?Wt(Kt(i)):{},Ze(t||!i||!i.__esModule?Le(e,"default",{value:i,enumerable:!0}):e,i)),Bt=i=>Ze(Le({},"__esModule",{value:!0}),i);var ut=se((yi,Ke)=>{"use strict";var ce=typeof Reflect=="object"?Reflect:null,Qe=ce&&typeof ce.apply=="function"?ce.apply:function(t,e,n){return Function.prototype.apply.call(t,e,n)},Se;ce&&typeof ce.ownKeys=="function"?Se=ce.ownKeys:Object.getOwnPropertySymbols?Se=function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:Se=function(t){return Object.getOwnPropertyNames(t)};function Nt(i){console&&console.warn&&console.warn(i)}var Me=Number.isNaN||function(t){return t!==t};function A(){A.init.call(this)}Ke.exports=A;Ke.exports.once=Zt;A.EventEmitter=A;A.prototype._events=void 0;A.prototype._eventsCount=0;A.prototype._maxListeners=void 0;var Xe=10;function Ue(i){if(typeof i!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof i)}Object.defineProperty(A,"defaultMaxListeners",{enumerable:!0,get:function(){return Xe},set:function(i){if(typeof i!="number"||i<0||Me(i))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+i+".");Xe=i}});A.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};A.prototype.setMaxListeners=function(t){if(typeof t!="number"||t<0||Me(t))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+t+".");return this._maxListeners=t,this};function et(i){return i._maxListeners===void 0?A.defaultMaxListeners:i._maxListeners}A.prototype.getMaxListeners=function(){return et(this)};A.prototype.emit=function(t){for(var e=[],n=1;n<arguments.length;n++)e.push(arguments[n]);var s=t==="error",o=this._events;if(o!==void 0)s=s&&o.error===void 0;else if(!s)return!1;if(s){var r;if(e.length>0&&(r=e[0]),r instanceof Error)throw r;var u=new Error("Unhandled error."+(r?" ("+r.message+")":""));throw u.context=r,u}var a=o[t];if(a===void 0)return!1;if(typeof a=="function")Qe(a,this,e);else for(var h=a.length,l=ot(a,h),n=0;n<h;++n)Qe(l[n],this,e);return!0};function tt(i,t,e,n){var s,o,r;if(Ue(e),o=i._events,o===void 0?(o=i._events=Object.create(null),i._eventsCount=0):(o.newListener!==void 0&&(i.emit("newListener",t,e.listener?e.listener:e),o=i._events),r=o[t]),r===void 0)r=o[t]=e,++i._eventsCount;else if(typeof r=="function"?r=o[t]=n?[e,r]:[r,e]:n?r.unshift(e):r.push(e),s=et(i),s>0&&r.length>s&&!r.warned){r.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+r.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=i,u.type=t,u.count=r.length,Nt(u)}return i}A.prototype.addListener=function(t,e){return tt(this,t,e,!1)};A.prototype.on=A.prototype.addListener;A.prototype.prependListener=function(t,e){return tt(this,t,e,!0)};function qt(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function nt(i,t,e){var n={fired:!1,wrapFn:void 0,target:i,type:t,listener:e},s=qt.bind(n);return s.listener=e,n.wrapFn=s,s}A.prototype.once=function(t,e){return Ue(e),this.on(t,nt(this,t,e)),this};A.prototype.prependOnceListener=function(t,e){return Ue(e),this.prependListener(t,nt(this,t,e)),this};A.prototype.removeListener=function(t,e){var n,s,o,r,u;if(Ue(e),s=this._events,s===void 0)return this;if(n=s[t],n===void 0)return this;if(n===e||n.listener===e)--this._eventsCount===0?this._events=Object.create(null):(delete s[t],s.removeListener&&this.emit("removeListener",t,n.listener||e));else if(typeof n!="function"){for(o=-1,r=n.length-1;r>=0;r--)if(n[r]===e||n[r].listener===e){u=n[r].listener,o=r;break}if(o<0)return this;o===0?n.shift():Vt(n,o),n.length===1&&(s[t]=n[0]),s.removeListener!==void 0&&this.emit("removeListener",t,u||e)}return this};A.prototype.off=A.prototype.removeListener;A.prototype.removeAllListeners=function(t){var e,n,s;if(n=this._events,n===void 0)return this;if(n.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):n[t]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete n[t]),this;if(arguments.length===0){var o=Object.keys(n),r;for(s=0;s<o.length;++s)r=o[s],r!=="removeListener"&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(e=n[t],typeof e=="function")this.removeListener(t,e);else if(e!==void 0)for(s=e.length-1;s>=0;s--)this.removeListener(t,e[s]);return this};function it(i,t,e){var n=i._events;if(n===void 0)return[];var s=n[t];return s===void 0?[]:typeof s=="function"?e?[s.listener||s]:[s]:e?Yt(s):ot(s,s.length)}A.prototype.listeners=function(t){return it(this,t,!0)};A.prototype.rawListeners=function(t){return it(this,t,!1)};A.listenerCount=function(i,t){return typeof i.listenerCount=="function"?i.listenerCount(t):rt.call(i,t)};A.prototype.listenerCount=rt;function rt(i){var t=this._events;if(t!==void 0){var e=t[i];if(typeof e=="function")return 1;if(e!==void 0)return e.length}return 0}A.prototype.eventNames=function(){return this._eventsCount>0?Se(this._events):[]};function ot(i,t){for(var e=new Array(t),n=0;n<t;++n)e[n]=i[n];return e}function Vt(i,t){for(;t+1<i.length;t++)i[t]=i[t+1];i.pop()}function Yt(i){for(var t=new Array(i.length),e=0;e<t.length;++e)t[e]=i[e].listener||i[e];return t}function Zt(i,t){return new Promise(function(e,n){function s(r){i.removeListener(t,o),n(r)}function o(){typeof i.removeListener=="function"&&i.removeListener("error",s),e([].slice.call(arguments))}st(i,t,o,{once:!0}),t!=="error"&&Jt(i,s,{once:!0})})}function Jt(i,t,e){typeof i.on=="function"&&st(i,"error",t,e)}function st(i,t,e,n){if(typeof i.on=="function")n.once?i.once(t,e):i.on(t,e);else if(typeof i.addEventListener=="function")i.addEventListener(t,function s(o){n.once&&i.removeEventListener(t,s),e(o)});else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof i)}});var _t=se((bi,Et)=>{Et.exports=function(t){return t!==null&&typeof t=="object"&&typeof t.addUndirectedEdgeWithKey=="function"&&typeof t.dropNode=="function"&&typeof t.multi=="boolean"}});var Gt=se(We=>{function ii(i){return typeof i!="number"||isNaN(i)?1:i}function ri(i,t){var e={},n=function(r){return typeof r>"u"?t:r};typeof t=="function"&&(n=t);var s=function(r){return n(r[i])},o=function(){return n(void 0)};return typeof i=="string"?(e.fromAttributes=s,e.fromGraph=function(r,u){return s(r.getNodeAttributes(u))},e.fromEntry=function(r,u){return s(u)}):typeof i=="function"?(e.fromAttributes=function(){throw new Error("graphology-utils/getters/createNodeValueGetter: irrelevant usage.")},e.fromGraph=function(r,u){return n(i(u,r.getNodeAttributes(u)))},e.fromEntry=function(r,u){return n(i(r,u))}):(e.fromAttributes=o,e.fromGraph=o,e.fromEntry=o),e}function $t(i,t){var e={},n=function(r){return typeof r>"u"?t:r};typeof t=="function"&&(n=t);var s=function(r){return n(r[i])},o=function(){return n(void 0)};return typeof i=="string"?(e.fromAttributes=s,e.fromGraph=function(r,u){return s(r.getEdgeAttributes(u))},e.fromEntry=function(r,u){return s(u)},e.fromPartialEntry=e.fromEntry,e.fromMinimalEntry=e.fromEntry):typeof i=="function"?(e.fromAttributes=function(){throw new Error("graphology-utils/getters/createEdgeValueGetter: irrelevant usage.")},e.fromGraph=function(r,u){var a=r.extremities(u);return n(i(u,r.getEdgeAttributes(u),a[0],a[1],r.getNodeAttributes(a[0]),r.getNodeAttributes(a[1]),r.isUndirected(u)))},e.fromEntry=function(r,u,a,h,l,f,d){return n(i(r,u,a,h,l,f,d))},e.fromPartialEntry=function(r,u,a,h){return n(i(r,u,a,h))},e.fromMinimalEntry=function(r,u){return n(i(r,u))}):(e.fromAttributes=o,e.fromGraph=o,e.fromEntry=o,e.fromMinimalEntry=o),e}We.createNodeValueGetter=ri;We.createEdgeValueGetter=$t;We.createEdgeWeightGetter=function(i){return $t(i,ii)}});var St=se((vi,Lt)=>{var I=0,U=1,_=2,$=3,M=4,ee=5,k=6,kt=7,Pe=8,Dt=9,oi=0,si=1,ui=2,T=0,N=1,x=2,ue=3,te=4,O=5,K=6,Y=7,Z=8,At=3,V=10,ai=3,W=9,Ve=10;Lt.exports=function(t,e,n){var s,o,r,u,a,h,l,f,d,y,v=e.length,R=n.length,S=t.adjustSizes,C=t.barnesHutTheta*t.barnesHutTheta,P,D,E,G,J,m,b,c=[];for(r=0;r<v;r+=V)e[r+M]=e[r+_],e[r+ee]=e[r+$],e[r+_]=0,e[r+$]=0;if(t.outboundAttractionDistribution){for(P=0,r=0;r<v;r+=V)P+=e[r+k];P/=v/V}if(t.barnesHutOptimize){var ie=1/0,ae=-1/0,re=1/0,he=-1/0,F,de,xe;for(r=0;r<v;r+=V)ie=Math.min(ie,e[r+I]),ae=Math.max(ae,e[r+I]),re=Math.min(re,e[r+U]),he=Math.max(he,e[r+U]);var _e=ae-ie,$e=he-re;for(_e>$e?(re-=(_e-$e)/2,he=re+_e):(ie-=($e-_e)/2,ae=ie+$e),c[0+T]=-1,c[0+N]=(ie+ae)/2,c[0+x]=(re+he)/2,c[0+ue]=Math.max(ae-ie,he-re),c[0+te]=-1,c[0+O]=-1,c[0+K]=0,c[0+Y]=0,c[0+Z]=0,s=1,r=0;r<v;r+=V)for(o=0,xe=At;;)if(c[o+O]>=0){e[r+I]<c[o+N]?e[r+U]<c[o+x]?F=c[o+O]:F=c[o+O]+W:e[r+U]<c[o+x]?F=c[o+O]+W*2:F=c[o+O]+W*3,c[o+Y]=(c[o+Y]*c[o+K]+e[r+I]*e[r+k])/(c[o+K]+e[r+k]),c[o+Z]=(c[o+Z]*c[o+K]+e[r+U]*e[r+k])/(c[o+K]+e[r+k]),c[o+K]+=e[r+k],o=F;continue}else if(c[o+T]<0){c[o+T]=r;break}else{if(c[o+O]=s*W,f=c[o+ue]/2,d=c[o+O],c[d+T]=-1,c[d+N]=c[o+N]-f,c[d+x]=c[o+x]-f,c[d+ue]=f,c[d+te]=d+W,c[d+O]=-1,c[d+K]=0,c[d+Y]=0,c[d+Z]=0,d+=W,c[d+T]=-1,c[d+N]=c[o+N]-f,c[d+x]=c[o+x]+f,c[d+ue]=f,c[d+te]=d+W,c[d+O]=-1,c[d+K]=0,c[d+Y]=0,c[d+Z]=0,d+=W,c[d+T]=-1,c[d+N]=c[o+N]+f,c[d+x]=c[o+x]-f,c[d+ue]=f,c[d+te]=d+W,c[d+O]=-1,c[d+K]=0,c[d+Y]=0,c[d+Z]=0,d+=W,c[d+T]=-1,c[d+N]=c[o+N]+f,c[d+x]=c[o+x]+f,c[d+ue]=f,c[d+te]=c[o+te],c[d+O]=-1,c[d+K]=0,c[d+Y]=0,c[d+Z]=0,s+=4,e[c[o+T]+I]<c[o+N]?e[c[o+T]+U]<c[o+x]?F=c[o+O]:F=c[o+O]+W:e[c[o+T]+U]<c[o+x]?F=c[o+O]+W*2:F=c[o+O]+W*3,c[o+K]=e[c[o+T]+k],c[o+Y]=e[c[o+T]+I],c[o+Z]=e[c[o+T]+U],c[F+T]=c[o+T],c[o+T]=-1,e[r+I]<c[o+N]?e[r+U]<c[o+x]?de=c[o+O]:de=c[o+O]+W:e[r+U]<c[o+x]?de=c[o+O]+W*2:de=c[o+O]+W*3,F===de)if(xe--){o=F;continue}else{xe=At;break}c[de+T]=r;break}}if(t.barnesHutOptimize)for(D=t.scalingRatio,r=0;r<v;r+=V)for(o=0;;)if(c[o+O]>=0)if(m=Math.pow(e[r+I]-c[o+Y],2)+Math.pow(e[r+U]-c[o+Z],2),y=c[o+ue],4*y*y/m<C){if(E=e[r+I]-c[o+Y],G=e[r+U]-c[o+Z],S===!0?m>0?(b=D*e[r+k]*c[o+K]/m,e[r+_]+=E*b,e[r+$]+=G*b):m<0&&(b=-D*e[r+k]*c[o+K]/Math.sqrt(m),e[r+_]+=E*b,e[r+$]+=G*b):m>0&&(b=D*e[r+k]*c[o+K]/m,e[r+_]+=E*b,e[r+$]+=G*b),o=c[o+te],o<0)break;continue}else{o=c[o+O];continue}else{if(h=c[o+T],h>=0&&h!==r&&(E=e[r+I]-e[h+I],G=e[r+U]-e[h+U],m=E*E+G*G,S===!0?m>0?(b=D*e[r+k]*e[h+k]/m,e[r+_]+=E*b,e[r+$]+=G*b):m<0&&(b=-D*e[r+k]*e[h+k]/Math.sqrt(m),e[r+_]+=E*b,e[r+$]+=G*b):m>0&&(b=D*e[r+k]*e[h+k]/m,e[r+_]+=E*b,e[r+$]+=G*b)),o=c[o+te],o<0)break;continue}else for(D=t.scalingRatio,u=0;u<v;u+=V)for(a=0;a<u;a+=V)E=e[u+I]-e[a+I],G=e[u+U]-e[a+U],S===!0?(m=Math.sqrt(E*E+G*G)-e[u+Pe]-e[a+Pe],m>0?(b=D*e[u+k]*e[a+k]/m/m,e[u+_]+=E*b,e[u+$]+=G*b,e[a+_]-=E*b,e[a+$]-=G*b):m<0&&(b=100*D*e[u+k]*e[a+k],e[u+_]+=E*b,e[u+$]+=G*b,e[a+_]-=E*b,e[a+$]-=G*b)):(m=Math.sqrt(E*E+G*G),m>0&&(b=D*e[u+k]*e[a+k]/m/m,e[u+_]+=E*b,e[u+$]+=G*b,e[a+_]-=E*b,e[a+$]-=G*b));for(d=t.gravity/t.scalingRatio,D=t.scalingRatio,r=0;r<v;r+=V)b=0,E=e[r+I],G=e[r+U],m=Math.sqrt(Math.pow(E,2)+Math.pow(G,2)),t.strongGravityMode?m>0&&(b=D*e[r+k]*d):m>0&&(b=D*e[r+k]*d/m),e[r+_]-=E*b,e[r+$]-=G*b;for(D=1*(t.outboundAttractionDistribution?P:1),l=0;l<R;l+=ai)u=n[l+oi],a=n[l+si],f=n[l+ui],J=Math.pow(f,t.edgeWeightInfluence),E=e[u+I]-e[a+I],G=e[u+U]-e[a+U],S===!0?(m=Math.sqrt(E*E+G*G)-e[u+Pe]-e[a+Pe],t.linLogMode?t.outboundAttractionDistribution?m>0&&(b=-D*J*Math.log(1+m)/m/e[u+k]):m>0&&(b=-D*J*Math.log(1+m)/m):t.outboundAttractionDistribution?m>0&&(b=-D*J/e[u+k]):m>0&&(b=-D*J)):(m=Math.sqrt(Math.pow(E,2)+Math.pow(G,2)),t.linLogMode?t.outboundAttractionDistribution?m>0&&(b=-D*J*Math.log(1+m)/m/e[u+k]):m>0&&(b=-D*J*Math.log(1+m)/m):t.outboundAttractionDistribution?(m=1,b=-D*J/e[u+k]):(m=1,b=-D*J)),m>0&&(e[u+_]+=E*b,e[u+$]+=G*b,e[a+_]-=E*b,e[a+$]-=G*b);var Ge,ye,ke,oe,De,Ae;if(S===!0)for(r=0;r<v;r+=V)e[r+Dt]!==1&&(Ge=Math.sqrt(Math.pow(e[r+_],2)+Math.pow(e[r+$],2)),Ge>Ve&&(e[r+_]=e[r+_]*Ve/Ge,e[r+$]=e[r+$]*Ve/Ge),ye=e[r+k]*Math.sqrt((e[r+M]-e[r+_])*(e[r+M]-e[r+_])+(e[r+ee]-e[r+$])*(e[r+ee]-e[r+$])),ke=Math.sqrt((e[r+M]+e[r+_])*(e[r+M]+e[r+_])+(e[r+ee]+e[r+$])*(e[r+ee]+e[r+$]))/2,oe=.1*Math.log(1+ke)/(1+Math.sqrt(ye)),De=e[r+I]+e[r+_]*(oe/t.slowDown),e[r+I]=De,Ae=e[r+U]+e[r+$]*(oe/t.slowDown),e[r+U]=Ae);else for(r=0;r<v;r+=V)e[r+Dt]!==1&&(ye=e[r+k]*Math.sqrt((e[r+M]-e[r+_])*(e[r+M]-e[r+_])+(e[r+ee]-e[r+$])*(e[r+ee]-e[r+$])),ke=Math.sqrt((e[r+M]+e[r+_])*(e[r+M]+e[r+_])+(e[r+ee]+e[r+$])*(e[r+ee]+e[r+$]))/2,oe=e[r+kt]*Math.log(1+ke)/(1+Math.sqrt(ye)),e[r+kt]=Math.min(1,Math.sqrt(oe*(Math.pow(e[r+_],2)+Math.pow(e[r+$],2))/(1+Math.sqrt(ye)))),De=e[r+I]+e[r+_]*(oe/t.slowDown),e[r+I]=De,Ae=e[r+U]+e[r+$]*(oe/t.slowDown),e[r+U]=Ae);return{}}});var Ot=se(ne=>{var ve=10,Ut=3;ne.assign=function(i){i=i||{};var t=Array.prototype.slice.call(arguments).slice(1),e,n,s;for(e=0,s=t.length;e<s;e++)if(t[e])for(n in t[e])i[n]=t[e][n];return i};ne.validateSettings=function(i){return"linLogMode"in i&&typeof i.linLogMode!="boolean"?{message:"the `linLogMode` setting should be a boolean."}:"outboundAttractionDistribution"in i&&typeof i.outboundAttractionDistribution!="boolean"?{message:"the `outboundAttractionDistribution` setting should be a boolean."}:"adjustSizes"in i&&typeof i.adjustSizes!="boolean"?{message:"the `adjustSizes` setting should be a boolean."}:"edgeWeightInfluence"in i&&typeof i.edgeWeightInfluence!="number"?{message:"the `edgeWeightInfluence` setting should be a number."}:"scalingRatio"in i&&!(typeof i.scalingRatio=="number"&&i.scalingRatio>=0)?{message:"the `scalingRatio` setting should be a number >= 0."}:"strongGravityMode"in i&&typeof i.strongGravityMode!="boolean"?{message:"the `strongGravityMode` setting should be a boolean."}:"gravity"in i&&!(typeof i.gravity=="number"&&i.gravity>=0)?{message:"the `gravity` setting should be a number >= 0."}:"slowDown"in i&&!(typeof i.slowDown=="number"||i.slowDown>=0)?{message:"the `slowDown` setting should be a number >= 0."}:"barnesHutOptimize"in i&&typeof i.barnesHutOptimize!="boolean"?{message:"the `barnesHutOptimize` setting should be a boolean."}:"barnesHutTheta"in i&&!(typeof i.barnesHutTheta=="number"&&i.barnesHutTheta>=0)?{message:"the `barnesHutTheta` setting should be a number >= 0."}:null};ne.graphToByteArrays=function(i,t){var e=i.order,n=i.size,s={},o,r=new Float32Array(e*ve),u=new Float32Array(n*Ut);return o=0,i.forEachNode(function(a,h){s[a]=o,r[o]=h.x,r[o+1]=h.y,r[o+2]=0,r[o+3]=0,r[o+4]=0,r[o+5]=0,r[o+6]=1,r[o+7]=1,r[o+8]=h.size||1,r[o+9]=h.fixed?1:0,o+=ve}),o=0,i.forEachEdge(function(a,h,l,f,d,y,v){var R=s[l],S=s[f],C=t(a,h,l,f,d,y,v);r[R+6]+=C,r[S+6]+=C,u[o]=R,u[o+1]=S,u[o+2]=C,o+=Ut}),{nodes:r,edges:u}};ne.assignLayoutChanges=function(i,t,e){var n=0;i.updateEachNodeAttributes(function(s,o){return o.x=t[n],o.y=t[n+1],n+=ve,e?e(s,o):o})};ne.readGraphPositions=function(i,t){var e=0;i.forEachNode(function(n,s){t[e]=s.x,t[e+1]=s.y,e+=ve})};ne.collectLayoutChanges=function(i,t,e){for(var n=i.nodes(),s={},o=0,r=0,u=t.length;o<u;o+=ve){if(e){var a=Object.assign({},i.getNodeAttributes(n[r]));a.x=t[o],a.y=t[o+1],a=e(n[r],a),s[n[r]]={x:a.x,y:a.y}}else s[n[r]]={x:t[o],y:t[o+1]};r++}return s};ne.createWorker=function(t){var e=window.URL||window.webkitURL,n=t.toString(),s=e.createObjectURL(new Blob(["("+n+").call(this);"],{type:"text/javascript"})),o=new Worker(s);return e.revokeObjectURL(s),o}});var It=se((_i,Ct)=>{Ct.exports={linLogMode:!1,outboundAttractionDistribution:!1,adjustSizes:!1,edgeWeightInfluence:1,scalingRatio:1,strongGravityMode:!1,gravity:1,slowDown:1,barnesHutOptimize:!1,barnesHutTheta:.5}});var Tt=se(($i,jt)=>{var hi=_t(),di=Gt().createEdgeWeightGetter,ci=St(),Ee=Ot(),fi=It();function Rt(i,t,e){if(!hi(t))throw new Error("graphology-layout-forceatlas2: the given graph is not a valid graphology instance.");typeof e=="number"&&(e={iterations:e});var n=e.iterations;if(typeof n!="number")throw new Error("graphology-layout-forceatlas2: invalid number of iterations.");if(n<=0)throw new Error("graphology-layout-forceatlas2: you should provide a positive number of iterations.");var s=di("getEdgeWeight"in e?e.getEdgeWeight:"weight").fromEntry,o=typeof e.outputReducer=="function"?e.outputReducer:null,r=Ee.assign({},fi,e.settings),u=Ee.validateSettings(r);if(u)throw new Error("graphology-layout-forceatlas2: "+u.message);var a=Ee.graphToByteArrays(t,s),h;for(h=0;h<n;h++)ci(r,a.nodes,a.edges);if(i){Ee.assignLayoutChanges(t,a.nodes,o);return}return Ee.collectLayoutChanges(t,a.nodes)}function li(i){var t=typeof i=="number"?i:i.order;return{barnesHutOptimize:t>2e3,strongGravityMode:!0,gravity:.05,scalingRatio:10,slowDown:1+Math.log(t)}}var Ye=Rt.bind(null,!1);Ye.assign=Rt.bind(null,!0);Ye.inferSettings=li;jt.exports=Ye});var pi={};Ht(pi,{Graph:()=>L,forceAtlas2:()=>zt.default});module.exports=Bt(pi);var ct=Je(ut(),1);function Qt(){let i=arguments[0];for(let t=1,e=arguments.length;t<e;t++)if(arguments[t])for(let n in arguments[t])i[n]=arguments[t][n];return i}var j=Qt;typeof Object.assign=="function"&&(j=Object.assign);function B(i,t,e,n){let s=i._nodes.get(t),o=null;return s&&(n==="mixed"?o=s.out&&s.out[e]||s.undirected&&s.undirected[e]:n==="directed"?o=s.out&&s.out[e]:o=s.undirected&&s.undirected[e]),o}function z(i){return typeof i=="object"&&i!==null}function ft(i){let t;for(t in i)return!1;return!0}function H(i,t,e){Object.defineProperty(i,t,{enumerable:!1,configurable:!1,writable:!0,value:e})}function q(i,t,e){let n={enumerable:!0,configurable:!0};typeof e=="function"?n.get=e:(n.value=e,n.writable=!1),Object.defineProperty(i,t,n)}function at(i){return!(!z(i)||i.attributes&&!Array.isArray(i.attributes))}function Xt(){let i=Math.floor(Math.random()*256)&255;return()=>i++}function Q(){let i=arguments,t=null,e=-1;return{[Symbol.iterator](){return this},next(){let n=null;do{if(t===null){if(e++,e>=i.length)return{done:!0};t=i[e][Symbol.iterator]()}if(n=t.next(),n.done){t=null;continue}break}while(!0);return n}}}function le(){return{[Symbol.iterator](){return this},next(){return{done:!0}}}}var me=class extends Error{constructor(t){super(),this.name="GraphError",this.message=t}},g=class i extends me{constructor(t){super(t),this.name="InvalidArgumentsGraphError",typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(this,i.prototype.constructor)}},p=class i extends me{constructor(t){super(t),this.name="NotFoundGraphError",typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(this,i.prototype.constructor)}},w=class i extends me{constructor(t){super(t),this.name="UsageGraphError",typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(this,i.prototype.constructor)}};function lt(i,t){this.key=i,this.attributes=t,this.clear()}lt.prototype.clear=function(){this.inDegree=0,this.outDegree=0,this.undirectedDegree=0,this.undirectedLoops=0,this.directedLoops=0,this.in={},this.out={},this.undirected={}};function pt(i,t){this.key=i,this.attributes=t,this.clear()}pt.prototype.clear=function(){this.inDegree=0,this.outDegree=0,this.directedLoops=0,this.in={},this.out={}};function gt(i,t){this.key=i,this.attributes=t,this.clear()}gt.prototype.clear=function(){this.undirectedDegree=0,this.undirectedLoops=0,this.undirected={}};function pe(i,t,e,n,s){this.key=t,this.attributes=s,this.undirected=i,this.source=e,this.target=n}pe.prototype.attach=function(){let i="out",t="in";this.undirected&&(i=t="undirected");let e=this.source.key,n=this.target.key;this.source[i][n]=this,!(this.undirected&&e===n)&&(this.target[t][e]=this)};pe.prototype.attachMulti=function(){let i="out",t="in",e=this.source.key,n=this.target.key;this.undirected&&(i=t="undirected");let s=this.source[i],o=s[n];if(typeof o>"u"){s[n]=this,this.undirected&&e===n||(this.target[t][e]=this);return}o.previous=this,this.next=o,s[n]=this,this.target[t][e]=this};pe.prototype.detach=function(){let i=this.source.key,t=this.target.key,e="out",n="in";this.undirected&&(e=n="undirected"),delete this.source[e][t],delete this.target[n][i]};pe.prototype.detachMulti=function(){let i=this.source.key,t=this.target.key,e="out",n="in";this.undirected&&(e=n="undirected"),this.previous===void 0?this.next===void 0?(delete this.source[e][t],delete this.target[n][i]):(this.next.previous=void 0,this.source[e][t]=this.next,this.target[n][i]=this.next):(this.previous.next=this.next,this.next!==void 0&&(this.next.previous=this.previous))};var yt=0,wt=1,Mt=2,bt=3;function X(i,t,e,n,s,o,r){let u,a,h,l;if(n=""+n,e===yt){if(u=i._nodes.get(n),!u)throw new p(`Graph.${t}: could not find the "${n}" node in the graph.`);h=s,l=o}else if(e===bt){if(s=""+s,a=i._edges.get(s),!a)throw new p(`Graph.${t}: could not find the "${s}" edge in the graph.`);let f=a.source.key,d=a.target.key;if(n===f)u=a.target;else if(n===d)u=a.source;else throw new p(`Graph.${t}: the "${n}" node is not attached to the "${s}" edge (${f}, ${d}).`);h=o,l=r}else{if(a=i._edges.get(n),!a)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`);e===wt?u=a.source:u=a.target,h=s,l=o}return[u,h,l]}function en(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);return r.attributes[u]}}function tn(i,t,e){i.prototype[t]=function(n,s){let[o]=X(this,t,e,n,s);return o.attributes}}function nn(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);return r.attributes.hasOwnProperty(u)}}function rn(i,t,e){i.prototype[t]=function(n,s,o,r){let[u,a,h]=X(this,t,e,n,s,o,r);return u.attributes[a]=h,this.emit("nodeAttributesUpdated",{key:u.key,type:"set",attributes:u.attributes,name:a}),this}}function on(i,t,e){i.prototype[t]=function(n,s,o,r){let[u,a,h]=X(this,t,e,n,s,o,r);if(typeof h!="function")throw new g(`Graph.${t}: updater should be a function.`);let l=u.attributes,f=h(l[a]);return l[a]=f,this.emit("nodeAttributesUpdated",{key:u.key,type:"set",attributes:u.attributes,name:a}),this}}function sn(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);return delete r.attributes[u],this.emit("nodeAttributesUpdated",{key:r.key,type:"remove",attributes:r.attributes,name:u}),this}}function un(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);if(!z(u))throw new g(`Graph.${t}: provided attributes are not a plain object.`);return r.attributes=u,this.emit("nodeAttributesUpdated",{key:r.key,type:"replace",attributes:r.attributes}),this}}function an(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);if(!z(u))throw new g(`Graph.${t}: provided attributes are not a plain object.`);return j(r.attributes,u),this.emit("nodeAttributesUpdated",{key:r.key,type:"merge",attributes:r.attributes,data:u}),this}}function hn(i,t,e){i.prototype[t]=function(n,s,o){let[r,u]=X(this,t,e,n,s,o);if(typeof u!="function")throw new g(`Graph.${t}: provided updater is not a function.`);return r.attributes=u(r.attributes),this.emit("nodeAttributesUpdated",{key:r.key,type:"update",attributes:r.attributes}),this}}var dn=[{name:i=>`get${i}Attribute`,attacher:en},{name:i=>`get${i}Attributes`,attacher:tn},{name:i=>`has${i}Attribute`,attacher:nn},{name:i=>`set${i}Attribute`,attacher:rn},{name:i=>`update${i}Attribute`,attacher:on},{name:i=>`remove${i}Attribute`,attacher:sn},{name:i=>`replace${i}Attributes`,attacher:un},{name:i=>`merge${i}Attributes`,attacher:an},{name:i=>`update${i}Attributes`,attacher:hn}];function cn(i){dn.forEach(function({name:t,attacher:e}){e(i,t("Node"),yt),e(i,t("Source"),wt),e(i,t("Target"),Mt),e(i,t("Opposite"),bt)})}function fn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}return o.attributes[s]}}function ln(i,t,e){i.prototype[t]=function(n){let s;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>1){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let o=""+n,r=""+arguments[1];if(s=B(this,o,r,e),!s)throw new p(`Graph.${t}: could not find an edge for the given path ("${o}" - "${r}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,s=this._edges.get(n),!s)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}return s.attributes}}function pn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}return o.attributes.hasOwnProperty(s)}}function gn(i,t,e){i.prototype[t]=function(n,s,o){let r;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>3){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let u=""+n,a=""+s;if(s=arguments[2],o=arguments[3],r=B(this,u,a,e),!r)throw new p(`Graph.${t}: could not find an edge for the given path ("${u}" - "${a}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,r=this._edges.get(n),!r)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}return r.attributes[s]=o,this.emit("edgeAttributesUpdated",{key:r.key,type:"set",attributes:r.attributes,name:s}),this}}function yn(i,t,e){i.prototype[t]=function(n,s,o){let r;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>3){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let u=""+n,a=""+s;if(s=arguments[2],o=arguments[3],r=B(this,u,a,e),!r)throw new p(`Graph.${t}: could not find an edge for the given path ("${u}" - "${a}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,r=this._edges.get(n),!r)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}if(typeof o!="function")throw new g(`Graph.${t}: updater should be a function.`);return r.attributes[s]=o(r.attributes[s]),this.emit("edgeAttributesUpdated",{key:r.key,type:"set",attributes:r.attributes,name:s}),this}}function wn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}return delete o.attributes[s],this.emit("edgeAttributesUpdated",{key:o.key,type:"remove",attributes:o.attributes,name:s}),this}}function bn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}if(!z(s))throw new g(`Graph.${t}: provided attributes are not a plain object.`);return o.attributes=s,this.emit("edgeAttributesUpdated",{key:o.key,type:"replace",attributes:o.attributes}),this}}function mn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}if(!z(s))throw new g(`Graph.${t}: provided attributes are not a plain object.`);return j(o.attributes,s),this.emit("edgeAttributesUpdated",{key:o.key,type:"merge",attributes:o.attributes,data:s}),this}}function vn(i,t,e){i.prototype[t]=function(n,s){let o;if(this.type!=="mixed"&&e!=="mixed"&&e!==this.type)throw new w(`Graph.${t}: cannot find this type of edges in your ${this.type} graph.`);if(arguments.length>2){if(this.multi)throw new w(`Graph.${t}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);let r=""+n,u=""+s;if(s=arguments[2],o=B(this,r,u,e),!o)throw new p(`Graph.${t}: could not find an edge for the given path ("${r}" - "${u}").`)}else{if(e!=="mixed")throw new w(`Graph.${t}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);if(n=""+n,o=this._edges.get(n),!o)throw new p(`Graph.${t}: could not find the "${n}" edge in the graph.`)}if(typeof s!="function")throw new g(`Graph.${t}: provided updater is not a function.`);return o.attributes=s(o.attributes),this.emit("edgeAttributesUpdated",{key:o.key,type:"update",attributes:o.attributes}),this}}var En=[{name:i=>`get${i}Attribute`,attacher:fn},{name:i=>`get${i}Attributes`,attacher:ln},{name:i=>`has${i}Attribute`,attacher:pn},{name:i=>`set${i}Attribute`,attacher:gn},{name:i=>`update${i}Attribute`,attacher:yn},{name:i=>`remove${i}Attribute`,attacher:wn},{name:i=>`replace${i}Attributes`,attacher:bn},{name:i=>`merge${i}Attributes`,attacher:mn},{name:i=>`update${i}Attributes`,attacher:vn}];function _n(i){En.forEach(function({name:t,attacher:e}){e(i,t("Edge"),"mixed"),e(i,t("DirectedEdge"),"directed"),e(i,t("UndirectedEdge"),"undirected")})}var $n=[{name:"edges",type:"mixed"},{name:"inEdges",type:"directed",direction:"in"},{name:"outEdges",type:"directed",direction:"out"},{name:"inboundEdges",type:"mixed",direction:"in"},{name:"outboundEdges",type:"mixed",direction:"out"},{name:"directedEdges",type:"directed"},{name:"undirectedEdges",type:"undirected"}];function Gn(i,t,e,n){let s=!1;for(let o in t){if(o===n)continue;let r=t[o];if(s=e(r.key,r.attributes,r.source.key,r.target.key,r.source.attributes,r.target.attributes,r.undirected),i&&s)return r.key}}function kn(i,t,e,n){let s,o,r,u=!1;for(let a in t)if(a!==n){s=t[a];do{if(o=s.source,r=s.target,u=e(s.key,s.attributes,o.key,r.key,o.attributes,r.attributes,s.undirected),i&&u)return s.key;s=s.next}while(s!==void 0)}}function Fe(i,t){let e=Object.keys(i),n=e.length,s,o=0;return{[Symbol.iterator](){return this},next(){do if(s)s=s.next;else{if(o>=n)return{done:!0};let r=e[o++];if(r===t){s=void 0;continue}s=i[r]}while(!s);return{done:!1,value:{edge:s.key,attributes:s.attributes,source:s.source.key,target:s.target.key,sourceAttributes:s.source.attributes,targetAttributes:s.target.attributes,undirected:s.undirected}}}}}function Dn(i,t,e,n){let s=t[e];if(!s)return;let o=s.source,r=s.target;if(n(s.key,s.attributes,o.key,r.key,o.attributes,r.attributes,s.undirected)&&i)return s.key}function An(i,t,e,n){let s=t[e];if(!s)return;let o=!1;do{if(o=n(s.key,s.attributes,s.source.key,s.target.key,s.source.attributes,s.target.attributes,s.undirected),i&&o)return s.key;s=s.next}while(s!==void 0)}function He(i,t){let e=i[t];if(e.next!==void 0)return{[Symbol.iterator](){return this},next(){if(!e)return{done:!0};let s={edge:e.key,attributes:e.attributes,source:e.source.key,target:e.target.key,sourceAttributes:e.source.attributes,targetAttributes:e.target.attributes,undirected:e.undirected};return e=e.next,{done:!1,value:s}}};let n=!1;return{[Symbol.iterator](){return this},next(){return n===!0?{done:!0}:(n=!0,{done:!1,value:{edge:e.key,attributes:e.attributes,source:e.source.key,target:e.target.key,sourceAttributes:e.source.attributes,targetAttributes:e.target.attributes,undirected:e.undirected}})}}}function Ln(i,t){if(i.size===0)return[];if(t==="mixed"||t===i.type)return Array.from(i._edges.keys());let e=t==="undirected"?i.undirectedSize:i.directedSize,n=new Array(e),s=t==="undirected",o=i._edges.values(),r=0,u,a;for(;u=o.next(),u.done!==!0;)a=u.value,a.undirected===s&&(n[r++]=a.key);return n}function mt(i,t,e,n){if(t.size===0)return;let s=e!=="mixed"&&e!==t.type,o=e==="undirected",r,u,a=!1,h=t._edges.values();for(;r=h.next(),r.done!==!0;){if(u=r.value,s&&u.undirected!==o)continue;let{key:l,attributes:f,source:d,target:y}=u;if(a=n(l,f,d.key,y.key,d.attributes,y.attributes,u.undirected),i&&a)return l}}function Sn(i,t){if(i.size===0)return le();let e=t!=="mixed"&&t!==i.type,n=t==="undirected",s=i._edges.values();return{[Symbol.iterator](){return this},next(){let o,r;for(;;){if(o=s.next(),o.done)return o;if(r=o.value,!(e&&r.undirected!==n))break}return{value:{edge:r.key,attributes:r.attributes,source:r.source.key,target:r.target.key,sourceAttributes:r.source.attributes,targetAttributes:r.target.attributes,undirected:r.undirected},done:!1}}}}function Be(i,t,e,n,s,o){let r=t?kn:Gn,u;if(e!=="undirected"&&(n!=="out"&&(u=r(i,s.in,o),i&&u)||n!=="in"&&(u=r(i,s.out,o,n?void 0:s.key),i&&u))||e!=="directed"&&(u=r(i,s.undirected,o),i&&u))return u}function Un(i,t,e,n){let s=[];return Be(!1,i,t,e,n,function(o){s.push(o)}),s}function On(i,t,e){let n=le();return i!=="undirected"&&(t!=="out"&&typeof e.in<"u"&&(n=Q(n,Fe(e.in))),t!=="in"&&typeof e.out<"u"&&(n=Q(n,Fe(e.out,t?void 0:e.key)))),i!=="directed"&&typeof e.undirected<"u"&&(n=Q(n,Fe(e.undirected))),n}function Ne(i,t,e,n,s,o,r){let u=e?An:Dn,a;if(t!=="undirected"&&(typeof s.in<"u"&&n!=="out"&&(a=u(i,s.in,o,r),i&&a)||typeof s.out<"u"&&n!=="in"&&(n||s.key!==o)&&(a=u(i,s.out,o,r),i&&a))||t!=="directed"&&typeof s.undirected<"u"&&(a=u(i,s.undirected,o,r),i&&a))return a}function Cn(i,t,e,n,s){let o=[];return Ne(!1,i,t,e,n,s,function(r){o.push(r)}),o}function In(i,t,e,n){let s=le();return i!=="undirected"&&(typeof e.in<"u"&&t!=="out"&&n in e.in&&(s=Q(s,He(e.in,n))),typeof e.out<"u"&&t!=="in"&&n in e.out&&(t||e.key!==n)&&(s=Q(s,He(e.out,n)))),i!=="directed"&&typeof e.undirected<"u"&&n in e.undirected&&(s=Q(s,He(e.undirected,n))),s}function Rn(i,t){let{name:e,type:n,direction:s}=t;i.prototype[e]=function(o,r){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return[];if(!arguments.length)return Ln(this,n);if(arguments.length===1){o=""+o;let u=this._nodes.get(o);if(typeof u>"u")throw new p(`Graph.${e}: could not find the "${o}" node in the graph.`);return Un(this.multi,n==="mixed"?this.type:n,s,u)}if(arguments.length===2){o=""+o,r=""+r;let u=this._nodes.get(o);if(!u)throw new p(`Graph.${e}:  could not find the "${o}" source node in the graph.`);if(!this._nodes.has(r))throw new p(`Graph.${e}:  could not find the "${r}" target node in the graph.`);return Cn(n,this.multi,s,u,r)}throw new g(`Graph.${e}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`)}}function jn(i,t){let{name:e,type:n,direction:s}=t,o="forEach"+e[0].toUpperCase()+e.slice(1,-1);i.prototype[o]=function(h,l,f){if(!(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)){if(arguments.length===1)return f=h,mt(!1,this,n,f);if(arguments.length===2){h=""+h,f=l;let d=this._nodes.get(h);if(typeof d>"u")throw new p(`Graph.${o}: could not find the "${h}" node in the graph.`);return Be(!1,this.multi,n==="mixed"?this.type:n,s,d,f)}if(arguments.length===3){h=""+h,l=""+l;let d=this._nodes.get(h);if(!d)throw new p(`Graph.${o}:  could not find the "${h}" source node in the graph.`);if(!this._nodes.has(l))throw new p(`Graph.${o}:  could not find the "${l}" target node in the graph.`);return Ne(!1,n,this.multi,s,d,l,f)}throw new g(`Graph.${o}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`)}};let r="map"+e[0].toUpperCase()+e.slice(1);i.prototype[r]=function(){let h=Array.prototype.slice.call(arguments),l=h.pop(),f;if(h.length===0){let d=0;n!=="directed"&&(d+=this.undirectedSize),n!=="undirected"&&(d+=this.directedSize),f=new Array(d);let y=0;h.push((v,R,S,C,P,D,E)=>{f[y++]=l(v,R,S,C,P,D,E)})}else f=[],h.push((d,y,v,R,S,C,P)=>{f.push(l(d,y,v,R,S,C,P))});return this[o].apply(this,h),f};let u="filter"+e[0].toUpperCase()+e.slice(1);i.prototype[u]=function(){let h=Array.prototype.slice.call(arguments),l=h.pop(),f=[];return h.push((d,y,v,R,S,C,P)=>{l(d,y,v,R,S,C,P)&&f.push(d)}),this[o].apply(this,h),f};let a="reduce"+e[0].toUpperCase()+e.slice(1);i.prototype[a]=function(){let h=Array.prototype.slice.call(arguments);if(h.length<2||h.length>4)throw new g(`Graph.${a}: invalid number of arguments (expecting 2, 3 or 4 and got ${h.length}).`);if(typeof h[h.length-1]=="function"&&typeof h[h.length-2]!="function")throw new g(`Graph.${a}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`);let l,f;h.length===2?(l=h[0],f=h[1],h=[]):h.length===3?(l=h[1],f=h[2],h=[h[0]]):h.length===4&&(l=h[2],f=h[3],h=[h[0],h[1]]);let d=f;return h.push((y,v,R,S,C,P,D)=>{d=l(d,y,v,R,S,C,P,D)}),this[o].apply(this,h),d}}function Tn(i,t){let{name:e,type:n,direction:s}=t,o="find"+e[0].toUpperCase()+e.slice(1,-1);i.prototype[o]=function(a,h,l){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return!1;if(arguments.length===1)return l=a,mt(!0,this,n,l);if(arguments.length===2){a=""+a,l=h;let f=this._nodes.get(a);if(typeof f>"u")throw new p(`Graph.${o}: could not find the "${a}" node in the graph.`);return Be(!0,this.multi,n==="mixed"?this.type:n,s,f,l)}if(arguments.length===3){a=""+a,h=""+h;let f=this._nodes.get(a);if(!f)throw new p(`Graph.${o}:  could not find the "${a}" source node in the graph.`);if(!this._nodes.has(h))throw new p(`Graph.${o}:  could not find the "${h}" target node in the graph.`);return Ne(!0,n,this.multi,s,f,h,l)}throw new g(`Graph.${o}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`)};let r="some"+e[0].toUpperCase()+e.slice(1,-1);i.prototype[r]=function(){let a=Array.prototype.slice.call(arguments),h=a.pop();return a.push((f,d,y,v,R,S,C)=>h(f,d,y,v,R,S,C)),!!this[o].apply(this,a)};let u="every"+e[0].toUpperCase()+e.slice(1,-1);i.prototype[u]=function(){let a=Array.prototype.slice.call(arguments),h=a.pop();return a.push((f,d,y,v,R,S,C)=>!h(f,d,y,v,R,S,C)),!this[o].apply(this,a)}}function zn(i,t){let{name:e,type:n,direction:s}=t,o=e.slice(0,-1)+"Entries";i.prototype[o]=function(r,u){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return le();if(!arguments.length)return Sn(this,n);if(arguments.length===1){r=""+r;let a=this._nodes.get(r);if(!a)throw new p(`Graph.${o}: could not find the "${r}" node in the graph.`);return On(n,s,a)}if(arguments.length===2){r=""+r,u=""+u;let a=this._nodes.get(r);if(!a)throw new p(`Graph.${o}:  could not find the "${r}" source node in the graph.`);if(!this._nodes.has(u))throw new p(`Graph.${o}:  could not find the "${u}" target node in the graph.`);return In(n,s,a,u)}throw new g(`Graph.${o}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`)}}function Wn(i){$n.forEach(t=>{Rn(i,t),jn(i,t),Tn(i,t),zn(i,t)})}var Pn=[{name:"neighbors",type:"mixed"},{name:"inNeighbors",type:"directed",direction:"in"},{name:"outNeighbors",type:"directed",direction:"out"},{name:"inboundNeighbors",type:"mixed",direction:"in"},{name:"outboundNeighbors",type:"mixed",direction:"out"},{name:"directedNeighbors",type:"directed"},{name:"undirectedNeighbors",type:"undirected"}];function ze(){this.A=null,this.B=null}ze.prototype.wrap=function(i){this.A===null?this.A=i:this.B===null&&(this.B=i)};ze.prototype.has=function(i){return this.A!==null&&i in this.A||this.B!==null&&i in this.B};function we(i,t,e,n,s){for(let o in n){let r=n[o],u=r.source,a=r.target,h=u===e?a:u;if(t&&t.has(h.key))continue;let l=s(h.key,h.attributes);if(i&&l)return h.key}}function qe(i,t,e,n,s){if(t!=="mixed"){if(t==="undirected")return we(i,null,n,n.undirected,s);if(typeof e=="string")return we(i,null,n,n[e],s)}let o=new ze,r;if(t!=="undirected"){if(e!=="out"){if(r=we(i,null,n,n.in,s),i&&r)return r;o.wrap(n.in)}if(e!=="in"){if(r=we(i,o,n,n.out,s),i&&r)return r;o.wrap(n.out)}}if(t!=="directed"&&(r=we(i,o,n,n.undirected,s),i&&r))return r}function xn(i,t,e){if(i!=="mixed"){if(i==="undirected")return Object.keys(e.undirected);if(typeof t=="string")return Object.keys(e[t])}let n=[];return qe(!1,i,t,e,function(s){n.push(s)}),n}function be(i,t,e){let n=Object.keys(e),s=n.length,o=0;return{[Symbol.iterator](){return this},next(){let r=null;do{if(o>=s)return i&&i.wrap(e),{done:!0};let u=e[n[o++]],a=u.source,h=u.target;if(r=a===t?h:a,i&&i.has(r.key)){r=null;continue}}while(r===null);return{done:!1,value:{neighbor:r.key,attributes:r.attributes}}}}}function Kn(i,t,e){if(i!=="mixed"){if(i==="undirected")return be(null,e,e.undirected);if(typeof t=="string")return be(null,e,e[t])}let n=le(),s=new ze;return i!=="undirected"&&(t!=="out"&&(n=Q(n,be(s,e,e.in))),t!=="in"&&(n=Q(n,be(s,e,e.out)))),i!=="directed"&&(n=Q(n,be(s,e,e.undirected))),n}function Fn(i,t){let{name:e,type:n,direction:s}=t;i.prototype[e]=function(o){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return[];o=""+o;let r=this._nodes.get(o);if(typeof r>"u")throw new p(`Graph.${e}: could not find the "${o}" node in the graph.`);return xn(n==="mixed"?this.type:n,s,r)}}function Hn(i,t){let{name:e,type:n,direction:s}=t,o="forEach"+e[0].toUpperCase()+e.slice(1,-1);i.prototype[o]=function(h,l){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return;h=""+h;let f=this._nodes.get(h);if(typeof f>"u")throw new p(`Graph.${o}: could not find the "${h}" node in the graph.`);qe(!1,n==="mixed"?this.type:n,s,f,l)};let r="map"+e[0].toUpperCase()+e.slice(1);i.prototype[r]=function(h,l){let f=[];return this[o](h,(d,y)=>{f.push(l(d,y))}),f};let u="filter"+e[0].toUpperCase()+e.slice(1);i.prototype[u]=function(h,l){let f=[];return this[o](h,(d,y)=>{l(d,y)&&f.push(d)}),f};let a="reduce"+e[0].toUpperCase()+e.slice(1);i.prototype[a]=function(h,l,f){if(arguments.length<3)throw new g(`Graph.${a}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`);let d=f;return this[o](h,(y,v)=>{d=l(d,y,v)}),d}}function Bn(i,t){let{name:e,type:n,direction:s}=t,o=e[0].toUpperCase()+e.slice(1,-1),r="find"+o;i.prototype[r]=function(h,l){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return;h=""+h;let f=this._nodes.get(h);if(typeof f>"u")throw new p(`Graph.${r}: could not find the "${h}" node in the graph.`);return qe(!0,n==="mixed"?this.type:n,s,f,l)};let u="some"+o;i.prototype[u]=function(h,l){return!!this[r](h,l)};let a="every"+o;i.prototype[a]=function(h,l){return!this[r](h,(d,y)=>!l(d,y))}}function Nn(i,t){let{name:e,type:n,direction:s}=t,o=e.slice(0,-1)+"Entries";i.prototype[o]=function(r){if(n!=="mixed"&&this.type!=="mixed"&&n!==this.type)return le();r=""+r;let u=this._nodes.get(r);if(typeof u>"u")throw new p(`Graph.${o}: could not find the "${r}" node in the graph.`);return Kn(n==="mixed"?this.type:n,s,u)}}function qn(i){Pn.forEach(t=>{Fn(i,t),Hn(i,t),Bn(i,t),Nn(i,t)})}function Oe(i,t,e,n,s){let o=n._nodes.values(),r=n.type,u,a,h,l,f,d,y;for(;u=o.next(),u.done!==!0;){let v=!1;if(a=u.value,r!=="undirected"){l=a.out;for(h in l){f=l[h];do{if(d=f.target,v=!0,y=s(a.key,d.key,a.attributes,d.attributes,f.key,f.attributes,f.undirected),i&&y)return f;f=f.next}while(f)}}if(r!=="directed"){l=a.undirected;for(h in l)if(!(t&&a.key>h)){f=l[h];do{if(d=f.target,d.key!==h&&(d=f.source),v=!0,y=s(a.key,d.key,a.attributes,d.attributes,f.key,f.attributes,f.undirected),i&&y)return f;f=f.next}while(f)}}if(e&&!v&&(y=s(a.key,null,a.attributes,null,null,null,null),i&&y))return null}}function Vn(i,t){let e={key:i};return ft(t.attributes)||(e.attributes=j({},t.attributes)),e}function Yn(i,t,e){let n={key:t,source:e.source.key,target:e.target.key};return ft(e.attributes)||(n.attributes=j({},e.attributes)),i==="mixed"&&e.undirected&&(n.undirected=!0),n}function Zn(i){if(!z(i))throw new g('Graph.import: invalid serialized node. A serialized node should be a plain object with at least a "key" property.');if(!("key"in i))throw new g("Graph.import: serialized node is missing its key.");if("attributes"in i&&(!z(i.attributes)||i.attributes===null))throw new g("Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.")}function Jn(i){if(!z(i))throw new g('Graph.import: invalid serialized edge. A serialized edge should be a plain object with at least a "source" & "target" property.');if(!("source"in i))throw new g("Graph.import: serialized edge is missing its source.");if(!("target"in i))throw new g("Graph.import: serialized edge is missing its target.");if("attributes"in i&&(!z(i.attributes)||i.attributes===null))throw new g("Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.");if("undirected"in i&&typeof i.undirected!="boolean")throw new g("Graph.import: invalid undirectedness information. Undirected should be boolean or omitted.")}var Qn=Xt(),Xn=new Set(["directed","undirected","mixed"]),ht=new Set(["domain","_events","_eventsCount","_maxListeners"]),Mn=[{name:i=>`${i}Edge`,generateKey:!0},{name:i=>`${i}DirectedEdge`,generateKey:!0,type:"directed"},{name:i=>`${i}UndirectedEdge`,generateKey:!0,type:"undirected"},{name:i=>`${i}EdgeWithKey`},{name:i=>`${i}DirectedEdgeWithKey`,type:"directed"},{name:i=>`${i}UndirectedEdgeWithKey`,type:"undirected"}],ei={allowSelfLoops:!0,multi:!1,type:"mixed"};function ti(i,t,e){if(e&&!z(e))throw new g(`Graph.addNode: invalid attributes. Expecting an object but got "${e}"`);if(t=""+t,e=e||{},i._nodes.has(t))throw new w(`Graph.addNode: the "${t}" node already exist in the graph.`);let n=new i.NodeDataClass(t,e);return i._nodes.set(t,n),i.emit("nodeAdded",{key:t,attributes:e}),n}function dt(i,t,e){let n=new i.NodeDataClass(t,e);return i._nodes.set(t,n),i.emit("nodeAdded",{key:t,attributes:e}),n}function vt(i,t,e,n,s,o,r,u){if(!n&&i.type==="undirected")throw new w(`Graph.${t}: you cannot add a directed edge to an undirected graph. Use the #.addEdge or #.addUndirectedEdge instead.`);if(n&&i.type==="directed")throw new w(`Graph.${t}: you cannot add an undirected edge to a directed graph. Use the #.addEdge or #.addDirectedEdge instead.`);if(u&&!z(u))throw new g(`Graph.${t}: invalid attributes. Expecting an object but got "${u}"`);if(o=""+o,r=""+r,u=u||{},!i.allowSelfLoops&&o===r)throw new w(`Graph.${t}: source & target are the same ("${o}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`);let a=i._nodes.get(o),h=i._nodes.get(r);if(!a)throw new p(`Graph.${t}: source node "${o}" not found.`);if(!h)throw new p(`Graph.${t}: target node "${r}" not found.`);let l={key:null,undirected:n,source:o,target:r,attributes:u};if(e)s=i._edgeKeyGenerator();else if(s=""+s,i._edges.has(s))throw new w(`Graph.${t}: the "${s}" edge already exists in the graph.`);if(!i.multi&&(n?typeof a.undirected[r]<"u":typeof a.out[r]<"u"))throw new w(`Graph.${t}: an edge linking "${o}" to "${r}" already exists. If you really want to add multiple edges linking those nodes, you should create a multi graph by using the 'multi' option.`);let f=new pe(n,s,a,h,u);i._edges.set(s,f);let d=o===r;return n?(a.undirectedDegree++,h.undirectedDegree++,d&&(a.undirectedLoops++,i._undirectedSelfLoopCount++)):(a.outDegree++,h.inDegree++,d&&(a.directedLoops++,i._directedSelfLoopCount++)),i.multi?f.attachMulti():f.attach(),n?i._undirectedSize++:i._directedSize++,l.key=s,i.emit("edgeAdded",l),s}function ni(i,t,e,n,s,o,r,u,a){if(!n&&i.type==="undirected")throw new w(`Graph.${t}: you cannot merge/update a directed edge to an undirected graph. Use the #.mergeEdge/#.updateEdge or #.addUndirectedEdge instead.`);if(n&&i.type==="directed")throw new w(`Graph.${t}: you cannot merge/update an undirected edge to a directed graph. Use the #.mergeEdge/#.updateEdge or #.addDirectedEdge instead.`);if(u){if(a){if(typeof u!="function")throw new g(`Graph.${t}: invalid updater function. Expecting a function but got "${u}"`)}else if(!z(u))throw new g(`Graph.${t}: invalid attributes. Expecting an object but got "${u}"`)}o=""+o,r=""+r;let h;if(a&&(h=u,u=void 0),!i.allowSelfLoops&&o===r)throw new w(`Graph.${t}: source & target are the same ("${o}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`);let l=i._nodes.get(o),f=i._nodes.get(r),d,y;if(!e&&(d=i._edges.get(s),d)){if((d.source.key!==o||d.target.key!==r)&&(!n||d.source.key!==r||d.target.key!==o))throw new w(`Graph.${t}: inconsistency detected when attempting to merge the "${s}" edge with "${o}" source & "${r}" target vs. ("${d.source.key}", "${d.target.key}").`);y=d}if(!y&&!i.multi&&l&&(y=n?l.undirected[r]:l.out[r]),y){let P=[y.key,!1,!1,!1];if(a?!h:!u)return P;if(a){let D=y.attributes;y.attributes=h(D),i.emit("edgeAttributesUpdated",{type:"replace",key:y.key,attributes:y.attributes})}else j(y.attributes,u),i.emit("edgeAttributesUpdated",{type:"merge",key:y.key,attributes:y.attributes,data:u});return P}u=u||{},a&&h&&(u=h(u));let v={key:null,undirected:n,source:o,target:r,attributes:u};if(e)s=i._edgeKeyGenerator();else if(s=""+s,i._edges.has(s))throw new w(`Graph.${t}: the "${s}" edge already exists in the graph.`);let R=!1,S=!1;l||(l=dt(i,o,{}),R=!0,o===r&&(f=l,S=!0)),f||(f=dt(i,r,{}),S=!0),d=new pe(n,s,l,f,u),i._edges.set(s,d);let C=o===r;return n?(l.undirectedDegree++,f.undirectedDegree++,C&&(l.undirectedLoops++,i._undirectedSelfLoopCount++)):(l.outDegree++,f.inDegree++,C&&(l.directedLoops++,i._directedSelfLoopCount++)),i.multi?d.attachMulti():d.attach(),n?i._undirectedSize++:i._directedSize++,v.key=s,i.emit("edgeAdded",v),[s,!0,R,S]}function fe(i,t){i._edges.delete(t.key);let{source:e,target:n,attributes:s}=t,o=t.undirected,r=e===n;o?(e.undirectedDegree--,n.undirectedDegree--,r&&(e.undirectedLoops--,i._undirectedSelfLoopCount--)):(e.outDegree--,n.inDegree--,r&&(e.directedLoops--,i._directedSelfLoopCount--)),i.multi?t.detachMulti():t.detach(),o?i._undirectedSize--:i._directedSize--,i.emit("edgeDropped",{key:t.key,attributes:s,source:e.key,target:n.key,undirected:o})}var L=class i extends ct.EventEmitter{constructor(t){if(super(),t=j({},ei,t),typeof t.multi!="boolean")throw new g(`Graph.constructor: invalid 'multi' option. Expecting a boolean but got "${t.multi}".`);if(!Xn.has(t.type))throw new g(`Graph.constructor: invalid 'type' option. Should be one of "mixed", "directed" or "undirected" but got "${t.type}".`);if(typeof t.allowSelfLoops!="boolean")throw new g(`Graph.constructor: invalid 'allowSelfLoops' option. Expecting a boolean but got "${t.allowSelfLoops}".`);let e=t.type==="mixed"?lt:t.type==="directed"?pt:gt;H(this,"NodeDataClass",e);let n="geid_"+Qn()+"_",s=0,o=()=>{let r;do r=n+s++;while(this._edges.has(r));return r};H(this,"_attributes",{}),H(this,"_nodes",new Map),H(this,"_edges",new Map),H(this,"_directedSize",0),H(this,"_undirectedSize",0),H(this,"_directedSelfLoopCount",0),H(this,"_undirectedSelfLoopCount",0),H(this,"_edgeKeyGenerator",o),H(this,"_options",t),ht.forEach(r=>H(this,r,this[r])),q(this,"order",()=>this._nodes.size),q(this,"size",()=>this._edges.size),q(this,"directedSize",()=>this._directedSize),q(this,"undirectedSize",()=>this._undirectedSize),q(this,"selfLoopCount",()=>this._directedSelfLoopCount+this._undirectedSelfLoopCount),q(this,"directedSelfLoopCount",()=>this._directedSelfLoopCount),q(this,"undirectedSelfLoopCount",()=>this._undirectedSelfLoopCount),q(this,"multi",this._options.multi),q(this,"type",this._options.type),q(this,"allowSelfLoops",this._options.allowSelfLoops),q(this,"implementation",()=>"graphology")}_resetInstanceCounters(){this._directedSize=0,this._undirectedSize=0,this._directedSelfLoopCount=0,this._undirectedSelfLoopCount=0}hasNode(t){return this._nodes.has(""+t)}hasDirectedEdge(t,e){if(this.type==="undirected")return!1;if(arguments.length===1){let n=""+t,s=this._edges.get(n);return!!s&&!s.undirected}else if(arguments.length===2){t=""+t,e=""+e;let n=this._nodes.get(t);return n?n.out.hasOwnProperty(e):!1}throw new g(`Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`)}hasUndirectedEdge(t,e){if(this.type==="directed")return!1;if(arguments.length===1){let n=""+t,s=this._edges.get(n);return!!s&&s.undirected}else if(arguments.length===2){t=""+t,e=""+e;let n=this._nodes.get(t);return n?n.undirected.hasOwnProperty(e):!1}throw new g(`Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`)}hasEdge(t,e){if(arguments.length===1){let n=""+t;return this._edges.has(n)}else if(arguments.length===2){t=""+t,e=""+e;let n=this._nodes.get(t);return n?typeof n.out<"u"&&n.out.hasOwnProperty(e)||typeof n.undirected<"u"&&n.undirected.hasOwnProperty(e):!1}throw new g(`Graph.hasEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`)}directedEdge(t,e){if(this.type==="undirected")return;if(t=""+t,e=""+e,this.multi)throw new w("Graph.directedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.directedEdges instead.");let n=this._nodes.get(t);if(!n)throw new p(`Graph.directedEdge: could not find the "${t}" source node in the graph.`);if(!this._nodes.has(e))throw new p(`Graph.directedEdge: could not find the "${e}" target node in the graph.`);let s=n.out&&n.out[e]||void 0;if(s)return s.key}undirectedEdge(t,e){if(this.type==="directed")return;if(t=""+t,e=""+e,this.multi)throw new w("Graph.undirectedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.undirectedEdges instead.");let n=this._nodes.get(t);if(!n)throw new p(`Graph.undirectedEdge: could not find the "${t}" source node in the graph.`);if(!this._nodes.has(e))throw new p(`Graph.undirectedEdge: could not find the "${e}" target node in the graph.`);let s=n.undirected&&n.undirected[e]||void 0;if(s)return s.key}edge(t,e){if(this.multi)throw new w("Graph.edge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.edges instead.");t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.edge: could not find the "${t}" source node in the graph.`);if(!this._nodes.has(e))throw new p(`Graph.edge: could not find the "${e}" target node in the graph.`);let s=n.out&&n.out[e]||n.undirected&&n.undirected[e]||void 0;if(s)return s.key}areDirectedNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areDirectedNeighbors: could not find the "${t}" node in the graph.`);return this.type==="undirected"?!1:e in n.in||e in n.out}areOutNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areOutNeighbors: could not find the "${t}" node in the graph.`);return this.type==="undirected"?!1:e in n.out}areInNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areInNeighbors: could not find the "${t}" node in the graph.`);return this.type==="undirected"?!1:e in n.in}areUndirectedNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areUndirectedNeighbors: could not find the "${t}" node in the graph.`);return this.type==="directed"?!1:e in n.undirected}areNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areNeighbors: could not find the "${t}" node in the graph.`);return this.type!=="undirected"&&(e in n.in||e in n.out)||this.type!=="directed"&&e in n.undirected}areInboundNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areInboundNeighbors: could not find the "${t}" node in the graph.`);return this.type!=="undirected"&&e in n.in||this.type!=="directed"&&e in n.undirected}areOutboundNeighbors(t,e){t=""+t,e=""+e;let n=this._nodes.get(t);if(!n)throw new p(`Graph.areOutboundNeighbors: could not find the "${t}" node in the graph.`);return this.type!=="undirected"&&e in n.out||this.type!=="directed"&&e in n.undirected}inDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.inDegree: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.inDegree}outDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.outDegree: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.outDegree}directedDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.directedDegree: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.inDegree+e.outDegree}undirectedDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.undirectedDegree: could not find the "${t}" node in the graph.`);return this.type==="directed"?0:e.undirectedDegree}inboundDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.inboundDegree: could not find the "${t}" node in the graph.`);let n=0;return this.type!=="directed"&&(n+=e.undirectedDegree),this.type!=="undirected"&&(n+=e.inDegree),n}outboundDegree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.outboundDegree: could not find the "${t}" node in the graph.`);let n=0;return this.type!=="directed"&&(n+=e.undirectedDegree),this.type!=="undirected"&&(n+=e.outDegree),n}degree(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.degree: could not find the "${t}" node in the graph.`);let n=0;return this.type!=="directed"&&(n+=e.undirectedDegree),this.type!=="undirected"&&(n+=e.inDegree+e.outDegree),n}inDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.inDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.inDegree-e.directedLoops}outDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.outDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.outDegree-e.directedLoops}directedDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.directedDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);return this.type==="undirected"?0:e.inDegree+e.outDegree-e.directedLoops*2}undirectedDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.undirectedDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);return this.type==="directed"?0:e.undirectedDegree-e.undirectedLoops*2}inboundDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.inboundDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);let n=0,s=0;return this.type!=="directed"&&(n+=e.undirectedDegree,s+=e.undirectedLoops*2),this.type!=="undirected"&&(n+=e.inDegree,s+=e.directedLoops),n-s}outboundDegreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.outboundDegreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);let n=0,s=0;return this.type!=="directed"&&(n+=e.undirectedDegree,s+=e.undirectedLoops*2),this.type!=="undirected"&&(n+=e.outDegree,s+=e.directedLoops),n-s}degreeWithoutSelfLoops(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.degreeWithoutSelfLoops: could not find the "${t}" node in the graph.`);let n=0,s=0;return this.type!=="directed"&&(n+=e.undirectedDegree,s+=e.undirectedLoops*2),this.type!=="undirected"&&(n+=e.inDegree+e.outDegree,s+=e.directedLoops*2),n-s}source(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.source: could not find the "${t}" edge in the graph.`);return e.source.key}target(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.target: could not find the "${t}" edge in the graph.`);return e.target.key}extremities(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.extremities: could not find the "${t}" edge in the graph.`);return[e.source.key,e.target.key]}opposite(t,e){t=""+t,e=""+e;let n=this._edges.get(e);if(!n)throw new p(`Graph.opposite: could not find the "${e}" edge in the graph.`);let s=n.source.key,o=n.target.key;if(t===s)return o;if(t===o)return s;throw new p(`Graph.opposite: the "${t}" node is not attached to the "${e}" edge (${s}, ${o}).`)}hasExtremity(t,e){t=""+t,e=""+e;let n=this._edges.get(t);if(!n)throw new p(`Graph.hasExtremity: could not find the "${t}" edge in the graph.`);return n.source.key===e||n.target.key===e}isUndirected(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.isUndirected: could not find the "${t}" edge in the graph.`);return e.undirected}isDirected(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.isDirected: could not find the "${t}" edge in the graph.`);return!e.undirected}isSelfLoop(t){t=""+t;let e=this._edges.get(t);if(!e)throw new p(`Graph.isSelfLoop: could not find the "${t}" edge in the graph.`);return e.source===e.target}addNode(t,e){return ti(this,t,e).key}mergeNode(t,e){if(e&&!z(e))throw new g(`Graph.mergeNode: invalid attributes. Expecting an object but got "${e}"`);t=""+t,e=e||{};let n=this._nodes.get(t);return n?(e&&(j(n.attributes,e),this.emit("nodeAttributesUpdated",{type:"merge",key:t,attributes:n.attributes,data:e})),[t,!1]):(n=new this.NodeDataClass(t,e),this._nodes.set(t,n),this.emit("nodeAdded",{key:t,attributes:e}),[t,!0])}updateNode(t,e){if(e&&typeof e!="function")throw new g(`Graph.updateNode: invalid updater function. Expecting a function but got "${e}"`);t=""+t;let n=this._nodes.get(t);if(n){if(e){let o=n.attributes;n.attributes=e(o),this.emit("nodeAttributesUpdated",{type:"replace",key:t,attributes:n.attributes})}return[t,!1]}let s=e?e({}):{};return n=new this.NodeDataClass(t,s),this._nodes.set(t,n),this.emit("nodeAdded",{key:t,attributes:s}),[t,!0]}dropNode(t){t=""+t;let e=this._nodes.get(t);if(!e)throw new p(`Graph.dropNode: could not find the "${t}" node in the graph.`);let n;if(this.type!=="undirected"){for(let s in e.out){n=e.out[s];do fe(this,n),n=n.next;while(n)}for(let s in e.in){n=e.in[s];do fe(this,n),n=n.next;while(n)}}if(this.type!=="directed")for(let s in e.undirected){n=e.undirected[s];do fe(this,n),n=n.next;while(n)}this._nodes.delete(t),this.emit("nodeDropped",{key:t,attributes:e.attributes})}dropEdge(t){let e;if(arguments.length>1){let n=""+arguments[0],s=""+arguments[1];if(e=B(this,n,s,this.type),!e)throw new p(`Graph.dropEdge: could not find the "${n}" -> "${s}" edge in the graph.`)}else if(t=""+t,e=this._edges.get(t),!e)throw new p(`Graph.dropEdge: could not find the "${t}" edge in the graph.`);return fe(this,e),this}dropDirectedEdge(t,e){if(arguments.length<2)throw new w("Graph.dropDirectedEdge: it does not make sense to try and drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.");if(this.multi)throw new w("Graph.dropDirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.");t=""+t,e=""+e;let n=B(this,t,e,"directed");if(!n)throw new p(`Graph.dropDirectedEdge: could not find a "${t}" -> "${e}" edge in the graph.`);return fe(this,n),this}dropUndirectedEdge(t,e){if(arguments.length<2)throw new w("Graph.dropUndirectedEdge: it does not make sense to drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.");if(this.multi)throw new w("Graph.dropUndirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.");let n=B(this,t,e,"undirected");if(!n)throw new p(`Graph.dropUndirectedEdge: could not find a "${t}" -> "${e}" edge in the graph.`);return fe(this,n),this}clear(){this._edges.clear(),this._nodes.clear(),this._resetInstanceCounters(),this.emit("cleared")}clearEdges(){let t=this._nodes.values(),e;for(;e=t.next(),e.done!==!0;)e.value.clear();this._edges.clear(),this._resetInstanceCounters(),this.emit("edgesCleared")}getAttribute(t){return this._attributes[t]}getAttributes(){return this._attributes}hasAttribute(t){return this._attributes.hasOwnProperty(t)}setAttribute(t,e){return this._attributes[t]=e,this.emit("attributesUpdated",{type:"set",attributes:this._attributes,name:t}),this}updateAttribute(t,e){if(typeof e!="function")throw new g("Graph.updateAttribute: updater should be a function.");let n=this._attributes[t];return this._attributes[t]=e(n),this.emit("attributesUpdated",{type:"set",attributes:this._attributes,name:t}),this}removeAttribute(t){return delete this._attributes[t],this.emit("attributesUpdated",{type:"remove",attributes:this._attributes,name:t}),this}replaceAttributes(t){if(!z(t))throw new g("Graph.replaceAttributes: provided attributes are not a plain object.");return this._attributes=t,this.emit("attributesUpdated",{type:"replace",attributes:this._attributes}),this}mergeAttributes(t){if(!z(t))throw new g("Graph.mergeAttributes: provided attributes are not a plain object.");return j(this._attributes,t),this.emit("attributesUpdated",{type:"merge",attributes:this._attributes,data:t}),this}updateAttributes(t){if(typeof t!="function")throw new g("Graph.updateAttributes: provided updater is not a function.");return this._attributes=t(this._attributes),this.emit("attributesUpdated",{type:"update",attributes:this._attributes}),this}updateEachNodeAttributes(t,e){if(typeof t!="function")throw new g("Graph.updateEachNodeAttributes: expecting an updater function.");if(e&&!at(e))throw new g("Graph.updateEachNodeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}");let n=this._nodes.values(),s,o;for(;s=n.next(),s.done!==!0;)o=s.value,o.attributes=t(o.key,o.attributes);this.emit("eachNodeAttributesUpdated",{hints:e||null})}updateEachEdgeAttributes(t,e){if(typeof t!="function")throw new g("Graph.updateEachEdgeAttributes: expecting an updater function.");if(e&&!at(e))throw new g("Graph.updateEachEdgeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}");let n=this._edges.values(),s,o,r,u;for(;s=n.next(),s.done!==!0;)o=s.value,r=o.source,u=o.target,o.attributes=t(o.key,o.attributes,r.key,u.key,r.attributes,u.attributes,o.undirected);this.emit("eachEdgeAttributesUpdated",{hints:e||null})}forEachAdjacencyEntry(t){if(typeof t!="function")throw new g("Graph.forEachAdjacencyEntry: expecting a callback.");Oe(!1,!1,!1,this,t)}forEachAdjacencyEntryWithOrphans(t){if(typeof t!="function")throw new g("Graph.forEachAdjacencyEntryWithOrphans: expecting a callback.");Oe(!1,!1,!0,this,t)}forEachAssymetricAdjacencyEntry(t){if(typeof t!="function")throw new g("Graph.forEachAssymetricAdjacencyEntry: expecting a callback.");Oe(!1,!0,!1,this,t)}forEachAssymetricAdjacencyEntryWithOrphans(t){if(typeof t!="function")throw new g("Graph.forEachAssymetricAdjacencyEntryWithOrphans: expecting a callback.");Oe(!1,!0,!0,this,t)}nodes(){return Array.from(this._nodes.keys())}forEachNode(t){if(typeof t!="function")throw new g("Graph.forEachNode: expecting a callback.");let e=this._nodes.values(),n,s;for(;n=e.next(),n.done!==!0;)s=n.value,t(s.key,s.attributes)}findNode(t){if(typeof t!="function")throw new g("Graph.findNode: expecting a callback.");let e=this._nodes.values(),n,s;for(;n=e.next(),n.done!==!0;)if(s=n.value,t(s.key,s.attributes))return s.key}mapNodes(t){if(typeof t!="function")throw new g("Graph.mapNode: expecting a callback.");let e=this._nodes.values(),n,s,o=new Array(this.order),r=0;for(;n=e.next(),n.done!==!0;)s=n.value,o[r++]=t(s.key,s.attributes);return o}someNode(t){if(typeof t!="function")throw new g("Graph.someNode: expecting a callback.");let e=this._nodes.values(),n,s;for(;n=e.next(),n.done!==!0;)if(s=n.value,t(s.key,s.attributes))return!0;return!1}everyNode(t){if(typeof t!="function")throw new g("Graph.everyNode: expecting a callback.");let e=this._nodes.values(),n,s;for(;n=e.next(),n.done!==!0;)if(s=n.value,!t(s.key,s.attributes))return!1;return!0}filterNodes(t){if(typeof t!="function")throw new g("Graph.filterNodes: expecting a callback.");let e=this._nodes.values(),n,s,o=[];for(;n=e.next(),n.done!==!0;)s=n.value,t(s.key,s.attributes)&&o.push(s.key);return o}reduceNodes(t,e){if(typeof t!="function")throw new g("Graph.reduceNodes: expecting a callback.");if(arguments.length<2)throw new g("Graph.reduceNodes: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.");let n=e,s=this._nodes.values(),o,r;for(;o=s.next(),o.done!==!0;)r=o.value,n=t(n,r.key,r.attributes);return n}nodeEntries(){let t=this._nodes.values();return{[Symbol.iterator](){return this},next(){let e=t.next();if(e.done)return e;let n=e.value;return{value:{node:n.key,attributes:n.attributes},done:!1}}}}export(){let t=new Array(this._nodes.size),e=0;this._nodes.forEach((s,o)=>{t[e++]=Vn(o,s)});let n=new Array(this._edges.size);return e=0,this._edges.forEach((s,o)=>{n[e++]=Yn(this.type,o,s)}),{options:{type:this.type,multi:this.multi,allowSelfLoops:this.allowSelfLoops},attributes:this.getAttributes(),nodes:t,edges:n}}import(t,e=!1){if(t instanceof i)return t.forEachNode((a,h)=>{e?this.mergeNode(a,h):this.addNode(a,h)}),t.forEachEdge((a,h,l,f,d,y,v)=>{e?v?this.mergeUndirectedEdgeWithKey(a,l,f,h):this.mergeDirectedEdgeWithKey(a,l,f,h):v?this.addUndirectedEdgeWithKey(a,l,f,h):this.addDirectedEdgeWithKey(a,l,f,h)}),this;if(!z(t))throw new g("Graph.import: invalid argument. Expecting a serialized graph or, alternatively, a Graph instance.");if(t.attributes){if(!z(t.attributes))throw new g("Graph.import: invalid attributes. Expecting a plain object.");e?this.mergeAttributes(t.attributes):this.replaceAttributes(t.attributes)}let n,s,o,r,u;if(t.nodes){if(o=t.nodes,!Array.isArray(o))throw new g("Graph.import: invalid nodes. Expecting an array.");for(n=0,s=o.length;n<s;n++){r=o[n],Zn(r);let{key:a,attributes:h}=r;e?this.mergeNode(a,h):this.addNode(a,h)}}if(t.edges){let a=!1;if(this.type==="undirected"&&(a=!0),o=t.edges,!Array.isArray(o))throw new g("Graph.import: invalid edges. Expecting an array.");for(n=0,s=o.length;n<s;n++){u=o[n],Jn(u);let{source:h,target:l,attributes:f,undirected:d=a}=u,y;"key"in u?(y=e?d?this.mergeUndirectedEdgeWithKey:this.mergeDirectedEdgeWithKey:d?this.addUndirectedEdgeWithKey:this.addDirectedEdgeWithKey,y.call(this,u.key,h,l,f)):(y=e?d?this.mergeUndirectedEdge:this.mergeDirectedEdge:d?this.addUndirectedEdge:this.addDirectedEdge,y.call(this,h,l,f))}}return this}nullCopy(t){let e=new i(j({},this._options,t));return e.replaceAttributes(j({},this.getAttributes())),e}emptyCopy(t){let e=this.nullCopy(t);return this._nodes.forEach((n,s)=>{let o=j({},n.attributes);n=new e.NodeDataClass(s,o),e._nodes.set(s,n)}),e}copy(t){if(t=t||{},typeof t.type=="string"&&t.type!==this.type&&t.type!=="mixed")throw new w(`Graph.copy: cannot create an incompatible copy from "${this.type}" type to "${t.type}" because this would mean losing information about the current graph.`);if(typeof t.multi=="boolean"&&t.multi!==this.multi&&t.multi!==!0)throw new w("Graph.copy: cannot create an incompatible copy by downgrading a multi graph to a simple one because this would mean losing information about the current graph.");if(typeof t.allowSelfLoops=="boolean"&&t.allowSelfLoops!==this.allowSelfLoops&&t.allowSelfLoops!==!0)throw new w("Graph.copy: cannot create an incompatible copy from a graph allowing self loops to one that does not because this would mean losing information about the current graph.");let e=this.emptyCopy(t),n=this._edges.values(),s,o;for(;s=n.next(),s.done!==!0;)o=s.value,vt(e,"copy",!1,o.undirected,o.key,o.source.key,o.target.key,j({},o.attributes));return e}toJSON(){return this.export()}toString(){return"[object Graph]"}inspect(){let t={};this._nodes.forEach((o,r)=>{t[r]=o.attributes});let e={},n={};this._edges.forEach((o,r)=>{let u=o.undirected?"--":"->",a="",h=o.source.key,l=o.target.key,f;o.undirected&&h>l&&(f=h,h=l,l=f);let d=`(${h})${u}(${l})`;r.startsWith("geid_")?this.multi&&(typeof n[d]>"u"?n[d]=0:n[d]++,a+=`${n[d]}. `):a+=`[${r}]: `,a+=d,e[a]=o.attributes});let s={};for(let o in this)this.hasOwnProperty(o)&&!ht.has(o)&&typeof this[o]!="function"&&typeof o!="symbol"&&(s[o]=this[o]);return s.attributes=this._attributes,s.nodes=t,s.edges=e,H(s,"constructor",this.constructor),s}};typeof Symbol<"u"&&(L.prototype[Symbol.for("nodejs.util.inspect.custom")]=L.prototype.inspect);Mn.forEach(i=>{["add","merge","update"].forEach(t=>{let e=i.name(t),n=t==="add"?vt:ni;i.generateKey?L.prototype[e]=function(s,o,r){return n(this,e,!0,(i.type||this.type)==="undirected",null,s,o,r,t==="update")}:L.prototype[e]=function(s,o,r,u){return n(this,e,!1,(i.type||this.type)==="undirected",s,o,r,u,t==="update")}})});cn(L);_n(L);Wn(L);qn(L);var Ce=class extends L{constructor(t){let e=j({type:"directed"},t);if("multi"in e&&e.multi!==!1)throw new g("DirectedGraph.from: inconsistent indication that the graph should be multi in given options!");if(e.type!=="directed")throw new g('DirectedGraph.from: inconsistent "'+e.type+'" type in given options!');super(e)}},Ie=class extends L{constructor(t){let e=j({type:"undirected"},t);if("multi"in e&&e.multi!==!1)throw new g("UndirectedGraph.from: inconsistent indication that the graph should be multi in given options!");if(e.type!=="undirected")throw new g('UndirectedGraph.from: inconsistent "'+e.type+'" type in given options!');super(e)}},Re=class extends L{constructor(t){let e=j({multi:!0},t);if("multi"in e&&e.multi!==!0)throw new g("MultiGraph.from: inconsistent indication that the graph should be simple in given options!");super(e)}},je=class extends L{constructor(t){let e=j({type:"directed",multi:!0},t);if("multi"in e&&e.multi!==!0)throw new g("MultiDirectedGraph.from: inconsistent indication that the graph should be simple in given options!");if(e.type!=="directed")throw new g('MultiDirectedGraph.from: inconsistent "'+e.type+'" type in given options!');super(e)}},Te=class extends L{constructor(t){let e=j({type:"undirected",multi:!0},t);if("multi"in e&&e.multi!==!0)throw new g("MultiUndirectedGraph.from: inconsistent indication that the graph should be simple in given options!");if(e.type!=="undirected")throw new g('MultiUndirectedGraph.from: inconsistent "'+e.type+'" type in given options!');super(e)}};function ge(i){i.from=function(t,e){let n=j({},t.options,e),s=new i(n);return s.import(t),s}}ge(L);ge(Ce);ge(Ie);ge(Re);ge(je);ge(Te);L.Graph=L;L.DirectedGraph=Ce;L.UndirectedGraph=Ie;L.MultiGraph=Re;L.MultiDirectedGraph=je;L.MultiUndirectedGraph=Te;L.InvalidArgumentsGraphError=g;L.NotFoundGraphError=p;L.UsageGraphError=w;var zt=Je(Tt(),1);

	return module.exports
}

/**
 * clearai-dsh —— 浏览器半(ClearAI 的面板)。
 *
 * 它注册两个座位:
 *   中栏 `conversation.view`    探索(问题 → 候选假设 → 下一步;过程记录里有判断列表与计划的世界树)
 *   中栏 `conversation.view`    本体(结论四部分 + 本体图 / 实体图 + 已确立的事实 + 经验)
 * 计划进度同步到 DSH 原生的 todo 停靠栏,不再有输入框芯片。
 * 交付与文件改动走 DSH 原生的卡片,技能走原生技能目录,这里都不另做一份。
 * 面板**只读**:没有写入口。要人拍板的事由开门的那次工具调用当场问人;「立为问题 / 暂缓」只替人往对话里发一句话。
 *
 * 面板自己不取数、不重算:宿主半注册的**会话投影单元** `clearai`(见 `lib/index.js`)把算好的
 * 视图推下来,`useProjection('clearai')` 读它。投影为空(`undefined`)时渲染平静的空态,
 * 绝不抛错、不显示堆栈。
 */

window.__ModuleLoader__.load({
	id: 'clearai-dsh',
	factory: (require) => {
		var module = { exports: {} }
		var exports = module.exports
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

		const React = require('react')
		/**
		 * **图渲染交给 React Flow**(`@xyflow/react`)。
		 *
		 * 它由 `tools/build-vendor.mjs` 打包成 `ui/vendor/xyflow.js`,build 时与这一文件
		 * **拼成同一份** lib/client.js——于是它是一个**同作用域的函数**,不是模块行。
		 *
		 * 为什么不做成模块行:模块系统的 `require` 只认**平台种子字**(react 之类)
		 * 与**启动图里的行**;运行时动态 `load()` 的行不在启动图里,`require` 会直接不认。
		 * 声明成函数就绕开了整张表,而它内部的 `require('react')` 绑定的正是宿主给工厂的那个。
		 *
		 * 拿不到时不炸整块面板:**把真实原因也说出来**——只说「不可用」而不说为什么,
		 * 读的人(和下一次修它的人)就得自己猜。原因同时进 console,便于排查。
		 *
		 * 判「有没有」**不能写 `typeof === 'function'`**:React 的组件可以是函数、也可以是
		 * `forwardRef` / `memo` 造出来的**对象**(v12 的 `ReactFlow` 正是 `forwardRef` 对象)。
		 * 按函数判会把一个完全合法的组件判成不可用——而这个错会伪装成「依赖没装上」。
		 */
		const XYFLOW_LOAD = (() => {
			try {
				if (typeof __clearaiXyflow !== 'function') return { module: null, reason: 'vendor 没打进来(ui/vendor/xyflow.js 缺失?)' }
				return { module: __clearaiXyflow(require), reason: null }
			} catch (error) {
				const reason = String(error?.message ?? error).slice(0, 160)
				try {
					console.warn('[clearai] React Flow 加载失败:', error)
				} catch {
					/* console 不在也不该让面板挂掉 */
				}
				return { module: null, reason }
			}
		})()
		const XYFlow = XYFLOW_LOAD.module

		/**
		 * **原生图标**(与本体页签同一族):dsh 右栏页签的 guide 吃一个 `icon` 组件,原生那几张页签用的是
		 * `@deepseek-ai/dsh-client-ui-primitives` 里那套(文件页签 = FileTypeIcon ✓)。
		 * 我们照同一套用,于是"面包屑"与"世界树"在视觉上属于同一个家族。
		 *
		 * 拿不到那个模块时**不报错**:`icon` 留空,原生会用它自己的默认字形——
		 * 图标是装饰,不该让整块面板挂掉(与我们"降级要如实、不要崩"同一条纪律)。
		 */
		const NATIVE_ICONS = (() => {
			try {
				return require('@deepseek-ai/dsh-client-ui-primitives')
			} catch {
				return {}
			}
		})()
		const h = React.createElement
		/**
		 * **我们自己的标记**(与 `brand/logo.svg` 同一几何:开口的 c + 一颗事实点)。
		 *
		 * 为什么可以自画:右栏页签的 `guide.icon` 收的就是一个**组件**(原生那几张页签传的也是组件)。
		 * 之前我们借的是原生 `IconBranchOutline16` / `IconSkillOutline16` —— 那时讲的是"与原生同族";
		 * 现在这两个页签是我们自己的面,带我们自己的记号更诚实(它是 ClearAI 的面,不是宿主的面)。
		 *
		 * 几何是**主源里那一份**,不为小尺寸重画:16px 是品牌规则的唯一裁判(开口朝右上 -35°、
		 * 点在开口里、主笔 currentColor、点固定 emerald)。取不到标记组件时页面照常(它只是装饰)。
		 */
		const ClearAIMark = ({ size = 14, className }) =>
			h(
				'svg',
				{ viewBox: '0 0 1024 1024', width: size, height: size, className, fill: 'none', 'aria-hidden': 'true', focusable: 'false' },
				h('circle', { cx: 512, cy: 512, r: 326, stroke: 'currentColor', strokeWidth: 118, pathLength: 360, strokeDasharray: '270 90', strokeLinecap: 'round', transform: 'rotate(10 512 512)' }),
				h('circle', { cx: 792, cy: 308, r: 104, fill: '#10B981' }),
			)
		/**
		 * 惰性表:语言是**运行时**的事,而这些表在模块加载时就被求值了——直接写 `t(...)`
		 * 会把语言冻在加载那一刻(失效模式:面板标题跟着语言换了,表里的词还停在中文)。
		 * 这个代理每次取键都重新求值,读起来仍与普通对象一样。
		 */
		const lazyTable = (make) =>
			new Proxy(
				{},
				{
					get: (_target, key) => make()[key],
					has: (_target, key) => key in make(),
					ownKeys: () => Reflect.ownKeys(make()),
					getOwnPropertyDescriptor: (_target, key) => ({ configurable: true, enumerable: true, value: make()[key] }),
				},
			)

		/** 语言命名空间。表按**源文**索引:键就是中文原文,所以漏翻译一条只会退回中文,不会把 key 显示给人。 */
		const LOCALE_NS = 'clearai'
		const LOCALE_ZH = {"待执行":"待执行","已交付":"已交付","已作废":"已作废","支持":"支持","推翻":"推翻","不确定":"不确定","第 n 步":"第 n 步","判据:":"判据:","判据":"判据"," · 已修订 ":" · 已修订 "," 次":" 次"," · 最近一次修订的独立裁决:":" · 最近一次修订的独立裁决:","打开目标文档(原生预览)":"打开目标文档(原生预览)","全文在 ":"全文在 ","背景(不参与判定):":"背景(不参与判定):","目标":"目标","命题":"命题","计划":"计划","验证":"验证","观测":"观测","评估":"评估","证据":"证据","事实":"事实","批准":"批准","未解释":"未解释","评估卡":"评估卡","查看评估者":"查看评估者","审批记录":"审批记录","产物":"产物","已验证":"已验证","待核验":"待核验","验证中":"验证中","已推翻":"已推翻","已替换":"已替换","自行检验":"自行检验","独立核验":"独立核验","人工批准":"人工批准","判断":"判断","检验":"检验","纳入本体":"纳入本体","下一步:安排步骤对其进行检验":"下一步:安排步骤对其进行检验","下一步:通过独立核验后标记为已验证":"下一步:通过独立核验后标记为已验证","下一步:改用其他方法重新检验":"下一步:改用其他方法重新检验","下一步:结案时写入长期知识":"下一步:结案时写入长期知识","陈述":"陈述","数值":"数值","公式":"公式","代码":"代码","引用":"引用","概念":"概念","取值形态":"取值形态","实例":"实例","取值":"取值","关系":"关系","在检验阶段被推翻,不再推进。":"在检验阶段被推翻,不再推进。","已被替换,不再推进。":"已被替换,不再推进。","提出":"提出","单步检验":"单步检验",":":":","写入长期知识":"写入长期知识","人工撤回":"人工撤回","进度":"进度","可信度变化":"可信度变化","补充说明":"补充说明","依据":"依据","查看核验":"查看核验","查看记录":"查看记录","范围":"范围","推翻条件":"推翻条件","相关":"相关","在图中定位":"在图中定位","来源":"来源","收起":"收起","点击查看进度与来源":"点击查看进度与来源","暂无结论。模型提出判断后,将在此逐条列出。":"暂无结论。模型提出判断后,将在此逐条列出。","尚未设立目标":"尚未设立目标","暂无内容。发送第一条消息后,此处将显示本体图与结论。":"暂无内容。发送第一条消息后,此处将显示本体图与结论。","仅显示与「":"仅显示与「","」相关的内容":"」相关的内容","清除":"清除","已确立的事实":"已确立的事实","暂无已确立的事实。判断经检验与独立核验后,将在此列出;检验过程见探索货架。":"暂无已确立的事实。判断经检验与独立核验后,将在此列出;检验过程见探索货架。","经验(":"经验(",")":")","广度调研":"广度调研","定向求解":"定向求解","先调研后求解":"先调研后求解","考察中":"考察中","已排除":"已排除","已采纳":"已采纳","暂不考察":"暂不考察","未开始":"未开始","调研中":"调研中","已厘清":"已厘清","常见误区":"常见误区","前置核查":"前置核查","不可取的捷径":"不可取的捷径","先验知识":"先验知识","提出依据":"提出依据","未注明(直觉)":"未注明(直觉)","直觉":"直觉","本体关系「":"本体关系「","」":"」","主张":"主张","预测":"预测","排除依据":"排除依据","采纳依据":"采纳依据","关联记录":"关联记录","支持 ":"支持 "," 条 · 推翻 ":" 条 · 推翻 "," 条 · 无法判定 ":" 条 · 无法判定 "," 条":" 条","在本体货架中展开此结论":"在本体货架中展开此结论","已得出结论 · 查看结论":"已得出结论 · 查看结论","已暂缓":"已暂缓","新发现,待您决定":"新发现,待您决定","尚无候选假设":"尚无候选假设","候选假设 ":"候选假设 "," 个:":" 个:","问题 ":"问题 ","候选假设":"候选假设","展开":"展开","已请求立为问题,待模型修订立题后生效。":"已请求立为问题,待模型修订立题后生效。","已请求暂缓,结案时列入「尚未确定的事项」。":"已请求暂缓,结案时列入「尚未确定的事项」。","无法自动发送,请在对话中说明。":"无法自动发送,请在对话中说明。","新发现的问题":"新发现的问题","请将新发现的问题「":"请将新发现的问题「","」立为问题深入研究(问题 ":"」立为问题深入研究(问题 ",")。":")。","立为问题":"立为问题","请暂缓问题「":"请暂缓问题「","」(问题 ":"」(问题 ","),结案时列入「尚未确定的事项」。":"),结案时列入「尚未确定的事项」。","暂缓":"暂缓","调研板块":"调研板块","判断 ":"判断 "," 条 · 已采纳 ":" 条 · 已采纳 ","未解释的现象 ":"未解释的现象 "," 项":" 项","下一步":"下一步","预测:":"预测:","若「":"若「","」成立,预测":"」成立,预测","各候选假设的预测相同,此步骤无法区分它们。":"各候选假设的预测相同,此步骤无法区分它们。","如需调整计划,请在对话中说明。":"如需调整计划,请在对话中说明。","未解释的现象(":"未解释的现象(","结案前须解释、排除或写入「尚未确定的事项」":"结案前须解释、排除或写入「尚未确定的事项」","独立评估发现":"独立评估发现","涉及:":"涉及:","、":"、","暂无内容。发送第一条消息后,此处将显示问题、候选假设与下一步。":"暂无内容。发送第一条消息后,此处将显示问题、候选假设与下一步。","尚未设立目标。模型立题后,此处将显示问题、候选假设与下一步。":"尚未设立目标。模型立题后,此处将显示问题、候选假设与下一步。","阶段 · ":"阶段 · ","调研板块 ":"调研板块 "," 个 · 已厘清 ":" 个 · 已厘清 "," 个":" 个","当前问题 ":"当前问题 "," / 共 ":" / 共 ","计划 已完成 ":"计划 已完成 "," / ":" / "," 步":" 步","独立评估 ":"独立评估 ","计划共 ":"计划共 ","(":"(","进行中)":"进行中)","课题":"课题","待您处理(":"待您处理(","过程记录":"过程记录","结论":"结论","未能回答:":"未能回答:","查看探索记录":"查看探索记录","尚未确定的事项":"尚未确定的事项","待您决策":"待您决策","不适用:":"不适用:","暂无计划。建立计划后,此处将显示计划的步骤与闸门。":"暂无计划。建立计划后,此处将显示计划的步骤与闸门。","切换到以前的计划(计划均保留,文档归档在 clear/goals/plans/)":"切换到以前的计划(计划均保留,文档归档在 clear/goals/plans/)","计划 ":"计划 ","已完成 · 可查看存档":"已完成 · 可查看存档","步 ":"步 ","打开计划文档(原生预览)":"打开计划文档(原生预览)","计划文档":"计划文档","点击查看详情":"点击查看详情","查看步骤详情":"查看步骤详情"," 轮":" 轮","已派出评估者 ":"已派出评估者 ","收起详情":"收起详情","任务内容":"任务内容","状态":"状态","未声明":"未声明","磁盘上未找到该文件":"磁盘上未找到该文件","(缺失)":"(缺失)","在原生预览中打开":"在原生预览中打开","在原生预览中打开(计划声明的产物)":"在原生预览中打开(计划声明的产物)","查看此步骤的证据":"查看此步骤的证据","检验结果:":"检验结果:","独立核验:":"独立核验:","正在裁决":"正在裁决"," 查看核验过程":" 查看核验过程"," 查看核验记录":" 查看核验记录","待处理":"待处理","板块 ":"板块 "," · ":" · "," 个问题待您决定":" 个问题待您决定"," · 待检验假设 ":" · 待检验假设 ","计划受阻,待人工处理":"计划受阻,待人工处理","计划已收尾(":"计划已收尾("," 步)":" 步)","计划已交付 ":"计划已交付 ","待处理 ":"待处理 ","(点击打开探索货架)":"(点击打开探索货架)","仅显示相关项":"仅显示相关项","关闭":"关闭","正在加载…":"正在加载…","无法获取":"无法获取","该项已不在当前词表中(可能已被废止)。":"该项已不在当前词表中(可能已被废止)。","释义":"释义","上位":"上位","下位":"下位","主体":"主体","类型":"类型","该术语已废止,既有结论中的用法仍可查看。":"该术语已废止,既有结论中的用法仍可查看。","引用此项的结论":"引用此项的结论","有矛盾":"有矛盾","范围:":"范围:","展开下一层":"展开下一层","收起下一层":"收起下一层","共 ":"共 "," 条断言的主体尚未建立实体文件。":" 条断言的主体尚未建立实体文件。","实体图暂无内容。":"实体图暂无内容。","clear/ontology/entities/ 下的实体文件与写入长期知识的断言将在此显示。":"clear/ontology/entities/ 下的实体文件与写入长期知识的断言将在此显示。","本体图暂无内容。模型在 clear/ontology/concepts/ 与 relations/ 下建立概念与关系文件后,将在此显示。":"本体图暂无内容。模型在 clear/ontology/concepts/ 与 relations/ 下建立概念与关系文件后,将在此显示。","本体图":"本体图","实体图":"实体图","矛盾":"矛盾","适配":"适配","退出全屏":"退出全屏","全屏":"全屏","图组件不可用":"图组件不可用","结论仍可正常查看。":"结论仍可正常查看。","本体文件有 ":"本体文件有 "," 项问题(不纳入图中)":" 项问题(不纳入图中)","已提出":"已提出","探索":"探索","本体":"本体","clearai-loop: 席位跟着会话预设进出":"clearai-loop: 席位跟着会话预设进出","适用":"适用","超出适用范围":"超出适用范围","超出取值范围":"超出取值范围","本次条件未声明":"本次条件未声明","条目未声明适用范围":"条目未声明适用范围","口径已变更":"口径已变更","已撤回":"已撤回","本次不能直接沿用,需重新检验":"本次不能直接沿用,需重新检验","补充本次条件后重新判定":"补充本次条件后重新判定","沿用时需自行确认":"沿用时需自行确认","按新口径换算或重新检验":"按新口径换算或重新检验","先复检再沿用":"先复检再沿用","不得沿用":"不得沿用","已确立":"已确立","初步排除":"初步排除","测量或方法缺陷":"测量或方法缺陷","已解释":"已解释","已判定无关":"已判定无关","已提交您处理":"已提交您处理","请求复检":"请求复检","请复检条目「":"请复检条目「","」(":"」(","请求撤回":"请求撤回","请撤回条目「":"请撤回条目「","),并说明对已有结论的影响。":"),并说明对已有结论的影响。","请求修改适用范围":"请求修改适用范围","请与我确认条目「":"请与我确认条目「",")的适用范围应如何修改。":")的适用范围应如何修改。","推翻证据 ":"推翻证据 "," · 独立核验 ":" · 独立核验 ","受质疑":"受质疑","已发送请求,由模型处理后更新。":"已发送请求,由模型处理后更新。","适用边界":"适用边界","测量与口径":"测量与口径","校准关系":"校准关系","未解释的现象":"未解释的现象","经验":"经验","该实体暂无沉淀的知识。":"该实体暂无沉淀的知识。","引用的已有知识(":"引用的已有知识(","引用的已有知识":"引用的已有知识","引用者:":"引用者:","将沉淀的内容":"将沉淀的内容","已写入的排除与未解释项;结案时待独立核验的结论":"已写入的排除与未解释项;结案时待独立核验的结论","待独立核验":"待独立核验","已确立 ":"已确立 ","已排除 ":"已排除 ","未解释 ":"未解释 ","经验 ":"经验 ","本次沉淀":"本次沉淀","点击查看可发出的请求":"点击查看可发出的请求","初步排除(":"初步排除(","测量或方法缺陷 ":"测量或方法缺陷 "}
		const LOCALE_EN = {"待执行":"to do","已交付":"delivered","已作废":"voided","支持":"Support","推翻":"Refute","不确定":"Uncertain","第 n 步":"Step n","判据:":"Criterion: ","判据":"Criterion"," · 已修订 ":" · revised "," 次":" times"," · 最近一次修订的独立裁决:":" · latest revision decided by an independent verdict: ","打开目标文档(原生预览)":"Open the goal document (native preview)","全文在 ":"Full text at ","背景(不参与判定):":"Background (not part of the verdict): ","目标":"Goal","命题":"Propositions","计划":"Plan","验证":"Verification","观测":"Observation","评估":"Evaluation","证据":"Evidence","事实":"Facts","批准":"approval","未解释":"Unexplained","评估卡":"evaluation card","查看评估者":"view evaluator","审批记录":"approval record","产物":"Deliverables","已验证":"Verified","待核验":"Awaiting check","验证中":"Testing","已推翻":"Refuted","已替换":"Replaced","自行检验":"Self-tested","独立核验":"Independent check","人工批准":"Approved by a person","判断":"Judgment","检验":"Test","纳入本体":"In ontology","下一步:安排步骤对其进行检验":"Next: schedule a step to test it","下一步:通过独立核验后标记为已验证":"Next: marked Verified after an independent check","下一步:改用其他方法重新检验":"Next: test it again by another method","下一步:结案时写入长期知识":"Next: written to long-term knowledge at close","陈述":"Statement","数值":"Quantity","公式":"Formula","代码":"Code","引用":"Reference","概念":"concepts","取值形态":"Value form","实例":"Instances","取值":"Value","关系":"Relation","在检验阶段被推翻,不再推进。":"Refuted at the test stage; it goes no further.","已被替换,不再推进。":"Replaced; it goes no further.","提出":"Proposed","单步检验":"A single test",":":": ","写入长期知识":"Written to long-term knowledge","人工撤回":"Withdrawn by a person","进度":"Progress","可信度变化":"Trust history","补充说明":"Details","依据":"Basis","查看核验":"View check","查看记录":"View record","范围":"Scope","推翻条件":"Refuted if","相关":"Related","在图中定位":"Locate on the graph","来源":"Source","收起":"Collapse","点击查看进度与来源":"Click to view progress and source","暂无结论。模型提出判断后,将在此逐条列出。":"No judgments yet. Each judgment the model proposes is listed here.","尚未设立目标":"No goal set yet","暂无内容。发送第一条消息后,此处将显示本体图与结论。":"Nothing yet. After the first message, the ontology graph and conclusions appear here.","仅显示与「":"Showing only items related to \"","」相关的内容":"\"","清除":"Clear","已确立的事实":"ESTABLISHED FACTS","暂无已确立的事实。判断经检验与独立核验后,将在此列出;检验过程见探索货架。":"No established facts yet. Judgments appear here once tested and independently checked; the testing process is in the Explore shelf.","经验(":"LESSONS (",")":")","广度调研":"Broad survey","定向求解":"Targeted solving","先调研后求解":"Survey, then solve","考察中":"Being examined","已排除":"Excluded","已采纳":"Adopted","暂不考察":"Set aside","未开始":"Not started","调研中":"In progress","已厘清":"Clarified","常见误区":"Common pitfall","前置核查":"Check first","不可取的捷径":"Misleading shortcut","先验知识":"Prior knowledge","提出依据":"Proposed from","未注明(直觉)":"Not stated (intuition)","直觉":"Intuition","本体关系「":"Ontology relation \"","」":"\"","主张":"Claim","预测":"Prediction","排除依据":"Grounds for exclusion","采纳依据":"Grounds for adoption","关联记录":"Related records","支持 ":"Support "," 条 · 推翻 ":" · refute "," 条 · 无法判定 ":" · inconclusive "," 条":"","在本体货架中展开此结论":"Expand this conclusion in the Ontology shelf","已得出结论 · 查看结论":"Concluded · view the conclusion","已暂缓":"Parked","新发现,待您决定":"Newly found, awaiting your decision","尚无候选假设":"No candidate hypotheses yet","候选假设 ":"Candidate hypotheses: "," 个:":" — ","问题 ":"Question ","候选假设":"Candidate hypotheses","展开":"Expand","已请求立为问题,待模型修订立题后生效。":"Requested as a question; it takes effect once the model revises the framing.","已请求暂缓,结案时列入「尚未确定的事项」。":"Requested to park; it will be listed under open points at conclusion.","无法自动发送,请在对话中说明。":"Could not send automatically; please say it in the conversation.","新发现的问题":"Newly found question","请将新发现的问题「":"Please make the newly found question \"","」立为问题深入研究(问题 ":"\" a question to pursue (question ",")。":").","立为问题":"Make it a question","请暂缓问题「":"Please park the question \"","」(问题 ":"\" (question ","),结案时列入「尚未确定的事项」。":") and list it under open points at conclusion.","暂缓":"Park","调研板块":"Survey areas","判断 ":"Judgments: "," 条 · 已采纳 ":" · adopted ","未解释的现象 ":"Unexplained observations: "," 项":"","下一步":"Next step","预测:":"Prediction: ","若「":"If \"","」成立,预测":"\" holds, the prediction is","各候选假设的预测相同,此步骤无法区分它们。":"All candidate hypotheses predict the same result, so this step cannot tell them apart.","如需调整计划,请在对话中说明。":"To change the plan, say so in the conversation.","未解释的现象(":"Unexplained observations (","结案前须解释、排除或写入「尚未确定的事项」":"Before concluding, each must be explained, ruled out, or written into the open points","独立评估发现":"Found by the independent evaluator","涉及:":"Concerns: ","、":", ","暂无内容。发送第一条消息后,此处将显示问题、候选假设与下一步。":"Nothing yet. After the first message, questions, candidate hypotheses and the next step appear here.","尚未设立目标。模型立题后,此处将显示问题、候选假设与下一步。":"No goal set yet. Once the model frames the goal, questions, candidate hypotheses and the next step appear here.","阶段 · ":"Mode · ","调研板块 ":"Survey areas: "," 个 · 已厘清 ":" · clarified "," 个":"","当前问题 ":"Current question "," / 共 ":" of ","计划 已完成 ":"Plan: completed "," / ":" / "," 步":" steps","独立评估 ":"Independent evaluations: ","计划共 ":"Plan: ","(":" (","进行中)":" in progress)","课题":"Topic","待您处理(":"Awaiting you (","过程记录":"Process record","结论":"Conclusion","未能回答:":"Could not be answered: ","查看探索记录":"View the exploration record","尚未确定的事项":"Open points","待您决策":"For you to decide","不适用:":"Does not apply: ","暂无计划。建立计划后,此处将显示计划的步骤与闸门。":"No plan yet. Once a plan is created, its steps and gates appear here.","切换到以前的计划(计划均保留,文档归档在 clear/goals/plans/)":"Switch to an earlier plan (all plans are kept; documents are archived under clear/goals/plans/)","计划 ":"Plan ","已完成 · 可查看存档":"closed · archive available","步 ":"step ","打开计划文档(原生预览)":"Open the plan document (native preview)","计划文档":"Plan document","点击查看详情":"click for details","查看步骤详情":"view step details"," 轮":" rounds","已派出评估者 ":"Evaluators dispatched: ","收起详情":"Collapse details","任务内容":"Task","状态":"Status","未声明":"not declared","磁盘上未找到该文件":"this file was not found on disk","(缺失)":" (missing)","在原生预览中打开":"Open in the native preview","在原生预览中打开(计划声明的产物)":"Open in the native preview (an artifact declared by the plan)","查看此步骤的证据":"see the evidence for this step","检验结果:":"Result: ","独立核验:":"Independent check: ","正在裁决":"Deciding"," 查看核验过程":" View the review"," 查看核验记录":" View the review record","待处理":"To handle","板块 ":"Areas "," · ":" · "," 个问题待您决定":" question(s) awaiting your decision"," · 待检验假设 ":" · hypotheses to test: ","计划受阻,待人工处理":"plan blocked, awaiting a person","计划已收尾(":"Plan closed ("," 步)":" steps)","计划已交付 ":"Plan delivered ","待处理 ":"to handle ","(点击打开探索货架)":" (click to open the Explore shelf)","仅显示相关项":"Related only","关闭":"Close","正在加载…":"Loading…","无法获取":"Unavailable","该项已不在当前词表中(可能已被废止)。":"This item is no longer in the vocabulary (it may have been deprecated).","释义":"Gloss","上位":"Broader","下位":"Narrower","主体":"Subject","类型":"Type","该术语已废止,既有结论中的用法仍可查看。":"This term is deprecated; its use in existing conclusions remains readable.","引用此项的结论":"Conclusions citing it","有矛盾":"Conflicting","范围:":"Scope: ","展开下一层":"Expand the next level","收起下一层":"Collapse the next level","共 ":""," 条断言的主体尚未建立实体文件。":" assertion subjects have no entity file yet. ","实体图暂无内容。":"The entity graph is empty. ","clear/ontology/entities/ 下的实体文件与写入长期知识的断言将在此显示。":"Entity files under clear/ontology/entities/ and assertions in long-term knowledge appear here.","本体图暂无内容。模型在 clear/ontology/concepts/ 与 relations/ 下建立概念与关系文件后,将在此显示。":"The ontology graph is empty. Concepts and relations appear once the model creates files under clear/ontology/concepts/ and relations/.","本体图":"Ontology graph","实体图":"Entity graph","矛盾":"Conflicts","适配":"Fit","退出全屏":"Exit full screen","全屏":"Full screen","图组件不可用":"The graph component is unavailable","结论仍可正常查看。":"conclusions remain readable.","本体文件有 ":"Ontology files have "," 项问题(不纳入图中)":" problems (kept off the graph)","已提出":"proposed","探索":"Explore","本体":"Ontology","clearai-loop: 席位跟着会话预设进出":"clearai-loop: seats come and go with the session's preset","适用":"Applies","超出适用范围":"Outside its scope","超出取值范围":"Outside its value range","本次条件未声明":"Conditions of this run not declared","条目未声明适用范围":"Item declares no scope","口径已变更":"Definition changed","已撤回":"Retracted","本次不能直接沿用,需重新检验":"Cannot be reused as is here; test it again","补充本次条件后重新判定":"Declare this run's conditions, then judge again","沿用时需自行确认":"Confirm it applies before reusing it","按新口径换算或重新检验":"Convert to the new definition or test it again","先复检再沿用":"Re-check it before reusing it","不得沿用":"Must not be reused","已确立":"Established","初步排除":"Preliminarily excluded","测量或方法缺陷":"Measurement or method defect","已解释":"Explained","已判定无关":"Ruled irrelevant","已提交您处理":"Handed to you","请求复检":"Request a re-check","请复检条目「":"Please re-check the item \"","」(":"\" (","请求撤回":"Request retraction","请撤回条目「":"Please retract the item \"","),并说明对已有结论的影响。":") and state the effect on existing conclusions.","请求修改适用范围":"Request a scope change","请与我确认条目「":"Please confirm with me how the scope of the item \"",")的适用范围应如何修改。":") should be changed.","推翻证据 ":"Refuting evidence: "," · 独立核验 ":" · independently checked: ","受质疑":"Challenged","已发送请求,由模型处理后更新。":"Request sent; it updates once the model handles it.","适用边界":"Limits of applicability","测量与口径":"Measurement and definitions","校准关系":"Calibration","未解释的现象":"Unexplained observations","经验":"Lessons","该实体暂无沉淀的知识。":"No knowledge has been recorded for this entity yet.","引用的已有知识(":"Existing knowledge cited (","引用的已有知识":"Existing knowledge cited","引用者:":"Cited by: ","将沉淀的内容":"To be recorded","已写入的排除与未解释项;结案时待独立核验的结论":"Exclusions and unexplained items already written; conclusions awaiting an independent check at close","待独立核验":"Awaiting independent check","已确立 ":"Established: ","已排除 ":"Excluded: ","未解释 ":"Unexplained: ","经验 ":"Lessons: ","本次沉淀":"Recorded this time","点击查看可发出的请求":"Click to see the requests you can send","初步排除(":"Preliminarily excluded (","测量或方法缺陷 ":"Measurement or method defects: "}

		/**
		 * 翻译函数:**由原生 locale 座位绑定**(`ctx.locale.bind`),不是我们自建的一套 i18n。
		 * 座位不在(老宿主 / 测试桩)时退化成恒等函数 —— 面板照常显示中文,不会炸。
		 */
		let localeBound = (key) => key
		const t = (key) => localeBound(key)
		/** 语言变了要让组件重画:订阅者集合 + 一个极小的外部 store。 */
		const localeListeners = new Set()
		/** 语言变了需要**重新注册**的那些座位(标签在注册时求值)。 */
		const localeResyncs = new Set()
		function useLocaleTick() {
			const [, bump] = React.useState(0)
			React.useEffect(() => {
				const listener = () => bump((value) => value + 1)
				localeListeners.add(listener)
				return () => {
					localeListeners.delete(listener)
				}
			}, [])
		}
		/** 把注册出去的面板包一层:语言一变就重画(不重载页面)。 */
		function withLocale(Component) {
			return function Localized(props) {
				useLocaleTick()
				return h(Component, props)
			}
		}

		/**
		 * 依赖的客户端服务,**必须全部声明在这里**。
		 *
		 * 这不是洁癖,是行为约束:客户端模块在 `slots` 一出现就被激活
		 * (`slots` 是平台 seed,启动时就有),而 `sessions` / `sidebarRight` 是**后来**
		 * 才由各自的插件 `provide` 的。只声明 `slots` 的话,我们的 `apply()` 会在它们之前跑,
		 * 读不到会话服务 → 早退 → **一个插座都不注册**,而且不报错:右栏只剩宿主自带的「文件」,
		 * 中栏没有「产物」。宿主那侧一切正常(模块图里有我们、bundle 正常送达),
		 * 所以这个 bug 只在浏览器里看得见——单测里的假 ctx 恰好把两个服务都给了,于是全绿。
		 *
		 * 声明之后 Cordis 会把插件**挂起**到这些服务就位再激活(原生插件同样是这么写的,
		 * 例如 `dsh-client-ui-sidebar-files` 声明 slots + sidebarRightTabs + remote + locale)。
		 */
		const inject = ['slots', 'sessions', 'sidebarRight']

		const STEP = lazyTable(() => ({ open: t('待执行'), advanced: t('已交付'), void: t('已作废') }))
		const VERDICT = lazyTable(() => ({ support: t('支持'), refute: t('推翻'), inconclusive: t('不确定') }))
		
		/** 「第 n 步」:整句做一个词条,英文才排得成 Step n。 */
		const nth = (n) => t('第 n 步').replace('n', String(n))
		const dash = (value) => (value === null || value === undefined || value === '' ? '—' : String(value))
		const gloss = (table, value) => (value === null || value === undefined ? '—' : `${table[value] ?? value}`)
		const when = (at) => {
			if (typeof at !== 'number' || at <= 0) return '—'
			const d = new Date(at)
			const pad = (n) => String(n).padStart(2, '0')
			return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
		}

		/**
		 * 面板的 CSS:按钮与标签照抄**原生那一套**(取自宿主自己的包,不是我们编的):
		 *   · 28px 药丸(设置页的「Add model」):`.5px solid var(--dsw-alias-border-l3)` + `border-radius:14px`
		 *     + `bg:0 0` + `label-primary` + `font-size:12px;line-height:18px;padding:0 10px`
		 *   · 11px 小药丸(技能卡上的「inspect」):`.5px solid var(--dsw-alias-border-l4)`
		 *     + `border-radius:999px` + `bg-base` + `label-secondary` + `padding:2px 8px`
		 *   · 悬停一律 `var(--dsw-alias-interactive-bg-hover)`(原生包里的同名令牌)
		 * 颜色**只用主题令牌**,不写死色值——深色/浅色跟着宿主走。
		 */
		const CSS = `
.clearai-btn{box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap}
.clearai-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.clearai-btn:disabled{color:var(--dsw-alias-label-secondary);opacity:.5;cursor:default}
.clearai-btn[data-tone="warn"]{border-color:var(--dsw-alias-state-warn-primary)}
/* 工具行里的控制(控制归工具行):照原生那一行的形状——无边框、次级文字色、悬浮才出底。
   刻意不做成我们自己那种药丸:它坐在原生「完全权限」旁边,长得像原生才不突兀。 */
.clearai-chip{box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer}
.clearai-chip:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.clearai-tag{display:inline-block;padding:0 6px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;white-space:nowrap}
.clearai-tag[data-strong="1"]{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.clearai-link{color:var(--dsw-alias-label-primary);text-decoration:underline;text-underline-offset:2px;cursor:pointer}
.clearai-link:hover{color:var(--dsw-alias-brand-primary)}
/* 世界树的**唯一**活性惯用法(照抄 ClearAI PlanTree 的 globals.css):
   节点外的柔光环一呼一吸 = 这东西此刻在动;步骤与世界线共用它——两种闪法并存的话,
   读者得学两次「什么在动」。透明度区间刻意压在 0.22–0.07:光环是底噪级的存在感,
   不该盖过节点自己的语义色。 */
@keyframes clearai-breathe{0%,100%{opacity:.22}50%{opacity:.07}}
.clearai-breathe{animation:clearai-breathe 1.6s ease-in-out infinite}
/* Evaluator 正在审这一步:**虚线**描边环呼吸。与上面是两件事——填充柔光=它在跑,
   虚线描边=有外部观察者在看它。区分走**形状**不走颜色:颜色通道只表达结局。 */
@keyframes clearai-breathe-stroke{0%,100%{opacity:.85}50%{opacity:.35}}
.clearai-breathe-stroke{animation:clearai-breathe-stroke 1.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.clearai-breathe,.clearai-breathe-stroke{animation:none}}
/* 树的行(可选中):悬停与选中都是背景,不改变字形——字形只被状态占用。 */
.clearai-treerow{display:flex;align-items:center;gap:6px;padding:0 6px;cursor:pointer;border-radius:4px;transition:background .12s}
.clearai-treerow:hover{background:var(--dsw-alias-interactive-bg-hover)}
.clearai-treerow[data-sel="1"]{background:var(--dsw-alias-interactive-bg-active, var(--dsw-alias-interactive-bg-hover))}
/* ── 本体格(第六阶段):期刊式排版 + 进度轨。颜色只用主题令牌,深浅色跟着宿主走。 ── */
.clearai-atlas{height:100%;overflow-y:auto;box-sizing:border-box;padding:22px 26px 180px;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-primary)}
.clearai-serif,.clearai-question,.clearai-row-title,.clearai-card-title,.clearai-star>span{font-family:ui-serif,"Songti SC","Noto Serif SC","Source Han Serif SC",Georgia,serif}
.clearai-head{display:flex;flex-direction:column;gap:6px;padding-bottom:16px;margin-bottom:16px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.clearai-question{font-size:19px;font-weight:600;line-height:1.45;letter-spacing:.01em}
.clearai-counts{font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-need{display:flex;gap:8px;align-items:baseline;font-size:12.5px;padding:4px 10px;border-left:2px solid var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-bg-layer-1);border-radius:0 6px 6px 0}
.clearai-need b{font-weight:600;color:var(--dsw-alias-state-warn-primary);white-space:nowrap}
.clearai-track{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-track-stop{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.clearai-track-stop i{width:7px;height:7px;border-radius:50%;border:1px solid var(--dsw-alias-border-l3);box-sizing:border-box}
.clearai-track-stop[data-on="1"]{color:var(--dsw-alias-label-primary)}
.clearai-track-stop[data-on="1"] i{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.clearai-track-line{flex:1 1 18px;max-width:56px;height:1px;background:var(--dsw-alias-border-l2)}
.clearai-track-line[data-on="1"]{background:var(--dsw-alias-label-secondary)}
/* 图 */
.clearai-graph{margin-bottom:18px}
.clearai-graph[data-full="1"]{position:fixed;inset:0;z-index:40;background:var(--dsw-alias-bg-base);padding:16px 20px;display:flex;flex-direction:column;margin:0}
.clearai-graph-bar{display:flex;align-items:center;gap:14px;margin-bottom:8px;font-size:12px;position:relative;z-index:2}
.clearai-seg{display:inline-flex;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;padding:2px}
.clearai-seg>span{padding:2px 12px;border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.clearai-seg>span[data-on="1"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}
.clearai-legend{display:inline-flex;gap:12px;color:var(--dsw-alias-label-tertiary);font-size:11.5px}
.clearai-legend>span{display:inline-flex;align-items:center;gap:5px}
.clearai-legend>span::before{content:"";width:16px;border-top:1.3px solid var(--dsw-alias-label-secondary)}
.clearai-legend>span[data-l="dash"]::before{border-top-style:dashed;border-top-color:var(--dsw-alias-label-tertiary)}
.clearai-legend>span[data-l="warn"]::before{border-top-color:var(--dsw-alias-state-warn-primary)}
.clearai-graph-body{display:flex;flex-direction:column;gap:10px;min-height:0}
.clearai-graph[data-full="1"] .clearai-graph-body{flex:1 1 auto}
.clearai-graph-body[data-side="1"]{flex-direction:row}
.clearai-graph-canvas{height:340px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-base)}
/**
 * **缩放/适配控件跟着宿主主题走**(暗色下原来白底白图标,对比度 1.04:1)。
 *
 * React Flow 的 Controls 默认是它自己的浅色主题:按钮底色 #fefefe,而按钮颜色是 inherit ——
 * 暗色宿主把文字色设成近白,图标就继承成近白,于是白底上的白图标看不见。
 * 这里不传 colorMode(那会把整张图切到库自带的暗色板,和宿主令牌未必同色),
 * 只把控件用到的那几个库变量接到宿主令牌上:深浅色都跟着宿主走,不写死色值。
 */
.clearai-graph-canvas .react-flow{--xy-controls-button-background-color:var(--dsw-alias-bg-layer-1);--xy-controls-button-background-color-hover:var(--dsw-alias-interactive-bg-hover);--xy-controls-button-color:var(--dsw-alias-label-primary);--xy-controls-button-color-hover:var(--dsw-alias-label-primary);--xy-controls-button-border-color:var(--dsw-alias-border-l2)}
.clearai-graph[data-full="1"] .clearai-graph-canvas{height:auto;flex:1 1 auto;min-width:0}
/**
 * 全屏是自画的覆盖层(fixed / inset:0 / z-index:40),画布与右下角抽屉都长在它里面。
 * 「退出全屏」原来只是工具条里的一个文字链接(没有快捷键、也不保证不被画布盖住)——
 * 一旦它被遮住或换行挤出视口,用户只能刷新页面(社区 issue #33)。
 * 所以全屏时把退出入口做成浮层里的固定按钮:比覆盖层高一档(z-index 41),永远在右上角。
 */
.clearai-graph[data-full="1"] .clearai-link[data-exit="1"]{position:fixed;top:12px;right:20px;z-index:41;padding:3px 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:8px;background:var(--dsw-alias-bg-base);text-decoration:none}
.clearai-graph[data-full="1"] .clearai-link[data-exit="1"]:hover{border-color:var(--dsw-alias-label-secondary)}
.clearai-graph-side{flex:0 0 auto}
.clearai-graph-body[data-side="1"] .clearai-graph-side{width:380px;overflow-y:auto}
.clearai-graph-problems{margin-top:6px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}.clearai-graph-problems summary{cursor:pointer;color:var(--dsw-alias-state-warn-primary)}.clearai-graph-problems>div{padding:2px 0 2px 12px;line-height:1.5}.clearai-graph-problems>div[data-sev=info]{opacity:.7}.clearai-graph-problems code{font-size:11px}
.clearai-fold{margin-left:2px;padding:0 4px;border-radius:6px;font-weight:500;font-size:10.5px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-l2,rgba(127,127,127,.12));cursor:pointer}
.clearai-graph-empty{height:150px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 24px;border:.5px dashed var(--dsw-alias-border-l3);border-radius:10px;color:var(--dsw-alias-label-secondary);font-size:12.5px}
.react-flow__node.clearai-star-node .react-flow__handle{opacity:0;pointer-events:none;left:4.5px;top:50%;transform:translate(-50%,-50%);min-width:0;min-height:0;width:1px;height:1px;border:0}
.react-flow__node.clearai-star-node.selected,.react-flow__node.clearai-star-node:focus{box-shadow:none;outline:none}
.clearai-star{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:12.5px;color:var(--dsw-alias-label-primary);cursor:pointer}
.clearai-star>i{flex:0 0 auto;width:9px;height:9px;border-radius:50%;box-sizing:border-box;border:1.4px solid var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}
.clearai-star[data-kind="instance"]>i{background:var(--dsw-alias-label-primary)}
.clearai-star[data-kind="literal"]>i{width:6px;height:6px;border:0;background:var(--dsw-alias-label-secondary)}
.clearai-star[data-kind="literal"]{color:var(--dsw-alias-label-secondary);font-size:11.5px}
.clearai-star[data-kind="value_type"]>i{border-radius:2px;width:8px;height:8px;border-color:var(--dsw-alias-label-tertiary)}
.clearai-star[data-kind="value_type"]{color:var(--dsw-alias-label-secondary);font-size:11.5px}
.clearai-star[data-state="pending"]>i{border-style:dashed;background:var(--dsw-alias-bg-base);border-color:var(--dsw-alias-label-secondary)}
.clearai-star[data-state="off"]{opacity:.45}
.clearai-star[data-state="off"]>i{border-style:dashed}
.clearai-star[data-state="conflict"]>i{border-color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-state-warn-primary)}
.clearai-star[data-sel="1"]>i{box-shadow:0 0 0 4px var(--dsw-alias-interactive-bg-hover)}
.clearai-star[data-sel="1"]>span{font-weight:600}
/* 小卡 */
.clearai-card{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}
.clearai-card-head{display:flex;align-items:baseline;gap:8px;font-size:12px}
.clearai-card-kind{font-size:11px;color:var(--dsw-alias-label-tertiary);letter-spacing:.06em}
.clearai-card-title{font-size:15px;font-weight:600}
.clearai-card-facts{display:flex;flex-direction:column;gap:4px}
.clearai-card-fact{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;font-size:12.5px}
/* 结论 */
.clearai-section-head{font-size:11px;letter-spacing:.14em;color:var(--dsw-alias-label-tertiary);margin:4px 0 4px}
.clearai-filter{display:flex;gap:10px;align-items:baseline;font-size:12px;color:var(--dsw-alias-label-secondary);margin:-8px 0 12px}
.clearai-list{display:flex;flex-direction:column;gap:10px}
.clearai-group-head{display:flex;gap:6px;align-items:baseline;font-size:11.5px;color:var(--dsw-alias-label-secondary);margin:6px 0 2px}
.clearai-group-head>span{color:var(--dsw-alias-label-tertiary)}
.clearai-row{border-top:.5px solid var(--dsw-alias-border-l1)}
.clearai-row[data-open="1"]{background:var(--dsw-alias-bg-layer-1);border-radius:8px;border-top-color:transparent}
.clearai-row-head{display:flex;align-items:baseline;gap:10px;padding:7px 8px;cursor:pointer;border-radius:8px}
.clearai-row-head:hover{background:var(--dsw-alias-interactive-bg-hover)}
.clearai-row-title{font-size:14px;font-weight:500;white-space:nowrap}
.clearai-row-sub{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-row-step{margin-left:auto;font-size:11.5px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.clearai-row[data-trust="replaced"] .clearai-row-title{text-decoration:line-through;color:var(--dsw-alias-label-tertiary)}
.clearai-trust{flex:0 0 auto;display:inline-block;font-size:11px;line-height:16px;padding:0 7px;border-radius:999px;border:.5px solid var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary);white-space:nowrap}
.clearai-trust[data-trust="credible"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}
.clearai-trust[data-trust="testing"]{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary)}
.clearai-trust[data-trust="unclear"]{border-style:dashed;border-color:var(--dsw-alias-label-tertiary);color:var(--dsw-alias-label-secondary)}
.clearai-trust[data-trust="refuted"]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.clearai-trust[data-trust="replaced"]{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary)}
.clearai-trust[data-trust="conflict"]{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
/* 点开一条:三段 */
.clearai-detail{display:flex;flex-direction:column;gap:16px;padding:6px 12px 14px 12px}
.clearai-part-head{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--dsw-alias-label-tertiary);margin-bottom:8px}
.clearai-part-head b{width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.clearai-stations-bar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.clearai-stations-bar span{height:5px;border-radius:3px;background:var(--dsw-alias-border-l1)}
.clearai-stations-bar span[data-state="done"]{background:var(--dsw-alias-label-primary)}
.clearai-stations-bar span[data-state="next"]{background:repeating-linear-gradient(90deg,var(--dsw-alias-label-secondary) 0 4px,var(--dsw-alias-border-l1) 4px 8px)}
.clearai-stations-bar span[data-state="broken"]{background:var(--dsw-alias-state-error-primary)}
.clearai-stations-names{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-top:6px;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-stations-names span[data-now="1"]{color:var(--dsw-alias-label-primary);font-weight:600}
.clearai-stations-note{margin-top:6px;font-size:12px;color:var(--dsw-alias-state-error-primary)}
.clearai-tl{position:relative;display:flex;flex-direction:column}
.clearai-tl::before{content:"";position:absolute;left:4px;top:9px;bottom:9px;width:1px;background:var(--dsw-alias-border-l2)}
.clearai-tl-row{position:relative;display:grid;grid-template-columns:9px 76px 1fr;gap:10px;align-items:baseline;padding:2px 0;font-size:12.5px}
.clearai-tl-dot{width:9px;height:9px;border-radius:50%;box-sizing:border-box;align-self:center;background:var(--dsw-alias-label-primary)}
.clearai-tl-row[data-kind="proposed"] .clearai-tl-dot{background:var(--dsw-alias-bg-base);border:1.4px solid var(--dsw-alias-label-tertiary)}
.clearai-tl-row[data-verdict="refute"] .clearai-tl-dot{background:var(--dsw-alias-state-error-primary)}
.clearai-tl-row[data-verdict="inconclusive"] .clearai-tl-dot{background:var(--dsw-alias-bg-base);border:1.4px dashed var(--dsw-alias-label-secondary)}
.clearai-tl-row[data-kind="promoted"] .clearai-tl-dot{background:var(--dsw-alias-brand-primary)}
.clearai-tl-row[data-kind="next"]{color:var(--dsw-alias-label-tertiary)}
.clearai-tl-row[data-kind="next"] .clearai-tl-dot{background:var(--dsw-alias-bg-base);border:1px dashed var(--dsw-alias-label-tertiary)}
.clearai-tl-time{font-size:11.5px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.clearai-tl-move{font-weight:600}
.clearai-kv{display:grid;grid-template-columns:44px 1fr;gap:5px 14px;font-size:12.5px;line-height:1.6}
.clearai-kv>span:nth-child(odd){color:var(--dsw-alias-label-tertiary)}
.clearai-chips{display:inline-flex;gap:6px;flex-wrap:wrap}
.clearai-quiet{color:var(--dsw-alias-label-secondary);font-size:12.5px;padding:6px 0}
/* ── 探索货架:问题 → 候选假设 → 下一步;过程记录默认折叠。颜色只用主题令牌。 ── */
.clearai-head-kind{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-pills{display:flex;flex-wrap:wrap;gap:6px;font-size:12px}
.clearai-pill{padding:1px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary)}
.clearai-waiting{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;padding:8px 12px;margin-bottom:14px;border-radius:8px;border:.5px solid var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-bg-layer-1);font-size:12.5px}
.clearai-waiting b{color:var(--dsw-alias-state-warn-primary);font-weight:600}
.clearai-box{display:flex;flex-direction:column;margin-bottom:14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden}
.clearai-box-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;padding:10px 14px;background:var(--dsw-alias-bg-layer-1)}
.clearai-box[data-compact="1"] .clearai-box-head{background:transparent}
.clearai-box-kind{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-box-title{flex:1 1 220px;font-size:14px;font-weight:600}
.clearai-box-note{font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-box-foot{display:flex;flex-direction:column;gap:4px;padding:8px 14px;font-size:12px;color:var(--dsw-alias-label-tertiary);border-top:.5px solid var(--dsw-alias-border-l1)}
.clearai-parked{display:inline-flex;gap:8px;align-items:baseline}
.clearai-cand{border-top:.5px solid var(--dsw-alias-border-l1)}
.clearai-cand-head{width:100%;display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;padding:9px 14px;border:0;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}
.clearai-cand-head[data-static="1"]{cursor:default}
.clearai-cand-head:not([data-static="1"]):hover{background:var(--dsw-alias-interactive-bg-hover)}
.clearai-cand-name{font-weight:500}
.clearai-cand[data-s="excluded"] .clearai-cand-name{text-decoration:line-through;color:var(--dsw-alias-label-tertiary)}
.clearai-cand-note{flex:1 1 220px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-cand-chevron{margin-left:auto;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-cand-detail{display:flex;flex-direction:column;gap:3px;padding:0 14px 12px}
.clearai-kvrow{display:grid;grid-template-columns:64px 1fr;gap:10px;font-size:12.5px}
.clearai-kvrow>span:first-child{color:var(--dsw-alias-label-tertiary)}
.clearai-state{flex:0 0 auto;display:inline-block;font-size:11px;line-height:16px;padding:0 7px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.clearai-state[data-s="examining"],.clearai-state[data-s="in_progress"]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.clearai-state[data-s="excluded"]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.clearai-state[data-s="adopted"],.clearai-state[data-s="clear"]{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}
.clearai-state[data-s="set_aside"]{border-style:dashed}
.clearai-emergent{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:0 14px 10px;padding:8px 10px;border-radius:8px;border:.5px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}
.clearai-emergent-kind{font-size:11.5px;font-weight:600;color:var(--dsw-alias-brand-primary)}
.clearai-emergent-text{flex:1 1 200px;font-weight:500}
.clearai-emergent-actions{display:inline-flex;gap:8px}
.clearai-emergent-done{margin:0 14px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-btn{min-height:30px;padding:0 12px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer}
.clearai-btn[data-primary="1"]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.clearai-next{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding:12px 14px;border-radius:10px;border:.5px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}
.clearai-next-head{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}
.clearai-next-kind{font-size:11.5px;font-weight:600;color:var(--dsw-alias-brand-primary)}
.clearai-next-title{font-size:14px;font-weight:600}
.clearai-preds{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.clearai-pred{padding:8px 10px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base)}
.clearai-pred-if{font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.clearai-pred-value{font-size:13.5px;font-weight:600}
.clearai-next-note{font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-next-warn{font-size:12px;color:var(--dsw-alias-state-warn-primary);font-weight:600}
.clearai-anomaly{display:flex;flex-wrap:wrap;gap:4px 12px;padding:7px 14px;border-top:.5px solid var(--dsw-alias-border-l1);font-size:12.5px}
.clearai-anomaly-meta{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-process{border-top:.5px solid var(--dsw-alias-border-l2);padding-top:4px}
.clearai-process-head{width:100%;min-height:38px;display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;padding:0;border:0;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}
.clearai-process-head span{font-size:12px;color:var(--dsw-alias-label-secondary)}
.clearai-process-body{display:flex;flex-direction:column;gap:14px;padding:6px 0}
.clearai-judgments-head{display:flex;flex-direction:column;gap:4px}
/* 本体货架的结论卡:四部分 */
.clearai-answers{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}
.clearai-qtab{min-height:28px;padding:0 12px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.clearai-qtab[aria-pressed="true"]{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}
.clearai-answer{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden}
.clearai-answer-part{display:flex;flex-direction:column;gap:4px;padding:10px 14px;border-top:.5px solid var(--dsw-alias-border-l1)}
.clearai-answer-part:first-child{border-top:0}
.clearai-answer-part[data-warm="1"]{background:var(--dsw-alias-bg-layer-1)}
.clearai-answer-label{font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-tertiary)}
.clearai-answer-part[data-warm="1"] .clearai-answer-label{color:var(--dsw-alias-state-warn-primary)}
.clearai-answer-main{font-size:15px;font-weight:600}
.clearai-answer-lines{display:flex;flex-direction:column;gap:3px;font-size:12.5px}
.clearai-lesson{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;font-size:12.5px}
.clearai-lesson-kind{font-size:11px;padding:0 7px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary)}
.clearai-lesson-meta{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
/* 沉淀与取用:条目、实体卡、图上的计数 */
.clearai-kitem{display:flex;flex-direction:column;gap:3px;padding:7px 14px;border-top:.5px solid var(--dsw-alias-border-l1);font-size:12.5px}
.clearai-kitem-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}
.clearai-kitem-meta{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.clearai-kitem-asks{display:flex;flex-wrap:wrap;gap:6px}
.clearai-btn[data-small="1"]{min-height:24px;padding:0 9px;font-size:11.5px}
.clearai-state[data-s="preliminary_excluded"]{border-style:dashed;border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.clearai-state[data-s="established"],.clearai-state[data-s="applies"]{border-color:var(--dsw-alias-label-secondary);color:var(--dsw-alias-label-primary)}
.clearai-state[data-s="pending"],.clearai-state[data-s="undeclared"],.clearai-state[data-s="unscoped"]{border-style:dashed}
.clearai-state[data-s="bounded"],.clearai-state[data-s="out_of_scope"],.clearai-state[data-s="out_of_range"],.clearai-state[data-s="definition_changed"],.clearai-state[data-s="defect"]{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.clearai-state[data-s="retracted"]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.clearai-state[data-s="unresolved"],.clearai-state[data-s="escalated"]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.clearai-ecard{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 0 4px}
.clearai-ecard-title{display:flex;align-items:center;gap:8px;padding:0 14px;font-size:14px;font-weight:600}
.clearai-ecard-head{padding:4px 14px 2px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-tertiary)}
.clearai-kcount{display:inline-flex;gap:2px;font-family:ui-sans-serif,system-ui,sans-serif}
.clearai-kcount>em{font-style:normal;font-size:10px;line-height:13px;padding:0 4px;border-radius:4px;border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary)}
.clearai-kcount>em[data-b="excluded"]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.clearai-kcount>em[data-b="bounded"]{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.clearai-kcount>em[data-b="pending"]{border-style:dashed}
.clearai-kcount>em[data-b="unresolved"]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.clearai-kitem-head[data-click="1"]{cursor:pointer}
.clearai-ecard-fold>summary{padding:4px 14px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.clearai-kcount-legend{display:inline-flex;gap:8px;margin-left:6px}
.clearai-kcount-legend>span{display:inline-flex;align-items:center;gap:3px}
.clearai-kcount-legend em{display:inline-block;width:8px;height:8px;border-radius:2px;border:.5px solid var(--dsw-alias-border-l3)}
.clearai-kcount-legend em[data-b="excluded"]{border-color:var(--dsw-alias-state-error-primary)}
.clearai-kcount-legend em[data-b="bounded"]{border-color:var(--dsw-alias-state-warn-primary)}
.clearai-kcount-legend em[data-b="pending"]{border-style:dashed}
.clearai-kcount-legend em[data-b="unresolved"]{border-color:var(--dsw-alias-brand-primary)}
.clearai-settled{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:2px 2px 0;font-size:12.5px}
`
		/** 把上面那段 CSS 挂进页面(带 data-plugin 标记,宿主按包名记账,卸载时收掉)。 */
		function installStyles() {
			if (typeof document === 'undefined') return () => {}
			/** 只认自己那一张:图组件的样式表也挂着 data-plugin="clearai-dsh"(data-clearai="xyflow"),按包名查会误以为已经挂过。 */
			const existing = document.querySelector('style[data-plugin="clearai-dsh"][data-clearai="panel"]')
			if (existing !== null) return () => {}
			const tag = document.createElement('style')
			tag.dataset.plugin = 'clearai-dsh'
			tag.dataset.clearai = 'panel'
			tag.textContent = CSS
			document.head.append(tag)
			return () => {
				tag.remove()
			}
		}

		// ── 样式:颜色一律用主题令牌(--dsw-alias-*),不写死色值 ─────────────────
		const S = {
		/** 断言芯片:一条断言的一行;点开就地展开词条卡。 */
		chipRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 },
		chipWrap: { display: 'inline-flex', flexDirection: 'column', gap: 2, maxWidth: '100%' },
		chip: { display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 999, border: '1px solid rgba(127,127,127,0.35)', fontSize: 11, cursor: 'pointer', lineHeight: '20px' },
		chipCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(127,127,127,0.22)', background: 'var(--dsw-alias-bg-layer-1)', fontSize: 11 },
		chipCardTitle: { fontWeight: 600 },
		chipActions: { display: 'flex', gap: 10, marginTop: 2 },
		chipAction: { color: 'var(--dsh-alias-link-primary, #4a8dff)', cursor: 'pointer', fontSize: 11 },

			/** 空态里的标记行:quiet,只陈述"这一格是谁的",不跟正文抢。 */
			emptyMark: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--dsw-alias-label-tertiary)' },
			emptyName: { fontSize: 13, fontWeight: 600, letterSpacing: '.02em' },
			/** 小节标题前的小标:与标题同基线,quiet。 */
			headMark: { display: 'inline-flex', verticalAlign: '-2px', marginRight: 6 },
		/** 人门区:等人的事永远最先说,所以它排在最上面,用一条竖线标出来。 */
		gate: { display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', margin: '0 0 8px', borderLeft: '3px solid var(--dsw-alias-state-warn-primary)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 6 },
		gateRow: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' },
		row: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', padding: '3px 0' },
		pre: { whiteSpace: 'pre-wrap', wordBreak: 'break-word', font: 'inherit', fontSize: 12, maxHeight: 320, overflow: 'auto', background: 'var(--dsw-alias-bg-layer-2)', padding: 8, borderRadius: 6, margin: '4px 0 0', color: 'var(--dsw-alias-label-primary)' },
			wrap: { height: '100%', overflowY: 'auto', padding: '14px 16px 24px', fontSize: 12.5, lineHeight: 1.55, color: 'var(--dsw-alias-label-primary)' },
			bar: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', paddingBottom: 10, borderBottom: '.5px solid var(--dsw-alias-border-l1)', marginBottom: 14 },
			title: { fontSize: 13, fontWeight: 600, letterSpacing: 0.3 },
			dim: { color: 'var(--dsw-alias-label-secondary)' },
			faint: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.7 },
			mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11.5 },
			section: { marginBottom: 16 },
			head: { fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--dsw-alias-label-secondary)', marginBottom: 6 },
			row: { padding: '5px 0', borderTop: '.5px solid var(--dsw-alias-border-l1)' },
			rowFirst: { padding: '5px 0' },
			tag: { display: 'inline-block', padding: '0 6px', border: '.5px solid var(--dsw-alias-border-l3)', borderRadius: 999, color: 'var(--dsw-alias-label-secondary)', fontSize: 11, lineHeight: '16px', marginRight: 6, whiteSpace: 'nowrap' },
			tagStrong: { display: 'inline-block', padding: '0 6px', border: '.5px solid var(--dsw-alias-label-primary)', borderRadius: 999, color: 'var(--dsw-alias-label-primary)', fontSize: 11, lineHeight: '16px', marginRight: 6, fontWeight: 600, whiteSpace: 'nowrap' },
			inline: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' },
			kv: { display: 'grid', gridTemplateColumns: 'minmax(64px, max-content) 1fr', gap: '2px 10px', marginTop: 4 },
			empty: { padding: '28px 4px', color: 'var(--dsw-alias-label-secondary)', fontSize: 12.5, lineHeight: 1.7 },
			table: { width: '100%', borderCollapse: 'collapse', marginTop: 4 },
			th: { textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--dsw-alias-label-secondary)', padding: '3px 6px 3px 0', borderBottom: '.5px solid var(--dsw-alias-border-l1)' },
			td: { verticalAlign: 'top', padding: '4px 6px 4px 0', borderTop: '.5px solid var(--dsw-alias-border-l1)' },
			strip: { display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', padding: '2px 2px 4px', flexWrap: 'wrap' },
			branch: { marginTop: 4, paddingLeft: 10, borderLeft: '2px solid var(--dsw-alias-border-l2)' },
			branchFirst: { marginTop: 6, paddingLeft: 10, borderLeft: '2px solid var(--dsw-alias-border-l2)' },
			progressTrack: { display: 'inline-block', width: 90, height: 4, background: 'var(--dsw-alias-border-l1)', borderRadius: 2, verticalAlign: 'middle', marginLeft: 4 },
			progressBar: { display: 'block', height: 4, background: 'var(--dsw-alias-brand-primary)', borderRadius: 2 },
			/**
			 * 「事实」那一格:一个知识货架(上架=已确认事实,下架=命题)。
			 * 默认一行一条命题,只有主张 + 当前处境 + 等级判者;点开才展开来路与证据。
			 */
			group: { display: 'flex', gap: 6, alignItems: 'baseline', fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'var(--dsw-alias-label-secondary)', margin: '10px 0 2px' },
			groupN: { fontWeight: 400, color: 'var(--dsw-alias-label-secondary)', opacity: 0.7 },
			factRow: { padding: '6px 0', borderTop: '.5px solid var(--dsw-alias-border-l1)' },
			factClaim: { color: 'var(--dsw-alias-label-primary)' },
			factMeta: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', opacity: 0.85, marginTop: 1 },
			propRow: { padding: '6px 0', borderTop: '.5px solid var(--dsw-alias-border-l1)' },
			propOpen: { padding: '6px 0 2px', borderTop: '.5px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 6 },
			propHead: { display: 'grid', gridTemplateColumns: '1fr minmax(120px, auto) minmax(120px, auto)', gap: 10, alignItems: 'baseline', cursor: 'pointer' },
			propClaim: { color: 'var(--dsw-alias-label-primary)' },
			stale: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.6 },
			propWhere: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', opacity: 0.85, textAlign: 'left' },
			propJudge: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', textAlign: 'right', whiteSpace: 'nowrap' },
			propBody: { marginTop: 8, paddingLeft: 10, borderLeft: '2px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', gap: 4 },
			/** 流转图:竖排的状态机,走过的边实线、未走的虚线灰,当前态高亮。 */
			flow: { display: 'flex', flexDirection: 'column', gap: 0, margin: '2px 0 6px' },
			flowStep: { display: 'flex', flexDirection: 'column' },
			flowNode: { alignSelf: 'flex-start', display: 'inline-flex', gap: 6, alignItems: 'baseline', padding: '1px 10px', border: '.5px solid var(--dsw-alias-border-l2)', borderRadius: 999, fontSize: 11.5 },
			flowNow: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)', fontWeight: 600 },
			flowReached: { color: 'var(--dsw-alias-label-primary)', borderColor: 'var(--dsw-alias-label-secondary)' },
			flowOff: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.45, borderStyle: 'dashed' },
			flowEdgeOn: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', padding: '1px 0 1px 8px' },
			flowEdgeOff: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', opacity: 0.35, padding: '1px 0 1px 8px' },
			flowTag: { fontSize: 10, opacity: 0.75 },
			pathLine: { display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 11.5 },
			pathKey: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.7, minWidth: 34 },
			pathVal: { color: 'var(--dsw-alias-label-secondary)' },
			pathArrow: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.7 },
			pathNode: { color: 'var(--dsw-alias-label-primary)', fontWeight: 500 },
			evList: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 },
			evRow: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 11.5 },
			evHead: { color: 'var(--dsw-alias-label-primary)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, whiteSpace: 'nowrap' },
			evBasis: { color: 'var(--dsw-alias-label-secondary)', opacity: 0.85, flex: '1 1 auto', minWidth: 0 },
			fileLink: { color: 'var(--dsw-alias-brand-primary)', cursor: 'pointer', whiteSpace: 'nowrap' },
			pathFoot: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', opacity: 0.7, marginTop: 2 },
			/** 世界树页眉的判据小节:逐条带序号;左侧竖线说明它是「目标的一部分」而不是新面板。 */
			criteria: { display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 8, marginTop: 2, borderLeft: '2px solid var(--dsw-alias-border-l2)' },
			criteriaRow: { display: 'flex', gap: 6, alignItems: 'baseline', fontSize: 11.5 },
		}
		/** 可点的文本(替代裸下划线 span)。 */
		function Link(props) {
			return h('span', { className: 'clearai-link', title: props.title, onClick: props.onClick }, props.children)
		}



		function Tag(props) {
			return h('span', { style: props.strong === true ? S.tagStrong : S.tag }, props.children)
		}

		/**
		 * 小节。`mark: true` 时在标题前放我们的标记 —— **只有事实货架要它**:
		 * 那一格是这套系统真正的产物(已确认、可引用),标一下是"这一格由 ClearAI 维护"的陈述。
		 * 别的标题不标:标滥了就只是装饰(同类同一规矩,而不是到处贴)。
		 */
		function Section(props) {
			return h(
				'div',
				{ style: S.section },
				h(
					'div',
					{ style: S.head },
					props.mark === true ? h('span', { style: S.headMark }, h(ClearAIMark, { size: 13 })) : null,
					props.title,
				),
				props.children,
			)
		}

		/**
		 * 空态。**每一格空态都带我们的标记**——同类空态同一规矩,不是逐处装饰。
		 *
		 * 为什么标在这里而不是页签图标那一排:一排里两个一样的标是**重复**(试过,退了);
		 * 而空态一次只看得见一个,标记在这里是"这一格是我们的"这一句陈述,克制且不抢。
		 */
		function Empty(props) {
			return h(
				'div',
				{ style: S.empty },
				h(
					'div',
					{ style: S.emptyMark },
					h(ClearAIMark, { size: 22 }),
					h('span', { style: S.emptyName }, 'ClearAI'),
				),
				props.children,
			)
		}

		/**
		 * **目标那一块**(世界树页眉):主张一行 + **判据小节**(逐条带序号)。
		 *
		 * 判据是**多条**的清点清单(`Frame` 收 `criteria: string[]`)⇒ 挤成一句「判据:均值差…」
		 * 会把「第 3 条没做到」抹平。所以逐条列出来,修订史与全文指针各占一行。
		 * 读的是 `knowledgeView` 那一份(与运行态卡**同一份**);拿不到(旧宿主 / 测试桩)时
		 * 退回原来那句摘要——面板不许因为缺一份投影而空白,也不许自己再拼一套判据。
		 */
		function GoalLine(props) {
			const goal = props.goal
			if (goal === null || goal === undefined) return null
			const viewGoal = props.view?.goal ?? null
			/** 空清单与「没有这一份」是同一件事:都得退回旧式那一句摘要,不能显示一个「判据 · 0」的小节。 */
			const criteriaLines = Array.isArray(viewGoal?.criteriaLines) && viewGoal.criteriaLines.length > 0 ? viewGoal.criteriaLines : null
			const note = String(viewGoal?.criteriaNote ?? '')
			const history = Array.isArray(viewGoal?.criteriaHistory) ? viewGoal.criteriaHistory : []
			const lastAudit = history.length === 0 ? null : history[history.length - 1]?.audit
			const docPath = typeof viewGoal?.docPath === 'string' && viewGoal.docPath !== '' ? viewGoal.docPath : null
			const open = typeof props.openPreview === 'function' ? props.openPreview : null
			return h(
				'div',
				{ style: { ...S.rowFirst, display: 'flex', flexDirection: 'column', gap: 4 } },
				h(
					'div',
					{ style: S.inline },
					h('span', null, dash(goal.claim)),
					// 阶段与完成度归**状态条**(常驻可见)⇒ 这里不重复(两处说同一件事 = 冗余)
					// 旧式判据(整段 done_criteria、或投影里没有逐条那份):一句摘要 + 全文进 tooltip
					criteriaLines === null ? h('span', { style: S.faint, title: String(goal.doneCriteria ?? '') }, `${t('判据:')}${brief(goal.doneCriteria, 56)}`) : null,
				),
				criteriaLines === null
					? null
					: h(
							'div',
							{ style: S.criteria },
							h(
								'div',
								{ style: S.head },
								`${t('判据')} · ${criteriaLines.length}${history.length === 0 ? '' : `${t(' · 已修订 ')}${history.length}${t(' 次')}${lastAudit === null || lastAudit === undefined ? '' : `${t(' · 最近一次修订的独立裁决:')}${String(lastAudit)}`}`}`,
							),
							...criteriaLines.map((line, index) => h('div', { key: `criteria-${index}`, style: S.criteriaRow }, `${index + 1}. ${line}`)),
							// 全文的家与卡上那句指针是同一个路径(不各自拼一遍);沿用计划文档那条既有做法
							docPath === null || open === null ? null : h(Link, { onClick: () => open(docPath), title: t('打开目标文档(原生预览)') }, `${t('全文在 ')}${docPath}`),
							note === '' ? null : h('div', { style: S.faint }, `${t('背景(不参与判定):')}${brief(note, 120)}`),
						),
			)
		}

		/**
		 * 对象的**人话名字**。与本体声明里的对象名一一对应——交叉校验测试里
		 * 有一条「声明里每个对象都必须在这里有名字」,少一个就红(界面不许漏对象)。
		 */
		const LOOP_LABEL = lazyTable(() => ({
			goal: t('目标'),
			hypothesis: t('命题'),
			plan: t('计划'),
			step: t('验证'),
			observation: t('观测'),
			evaluation: t('评估'),
			evidence: t('证据'),
			fact: t('事实'),
			release: t('批准'),
			anomaly: t('未解释'),
		}))

		/**
		 * 一行够用的摘要。**真数据逼出来的**:评估者的依据常常是几百字的一整段
		 * (逐条对照判据 + 隔离标注),原样内联会把那一行撑到没法看。
		 * 摘要进列表,全文进 tooltip——「可查」不等于「必须占屏」。
		 */
		function brief(value, max = 64) {
			const text = String(value ?? '').replace(/\s+/g, ' ').trim()
			if (text === '') return '—'
			return text.length <= max ? text : `${text.slice(0, max)}…`
		}

		const LEVEL_RANK = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 }
		const levelRank = (value) => LEVEL_RANK[value] ?? -1

		/**
		 * 一条命题的证据。新账上每条证据写明它针对哪条命题(`evidence.hypothesis`);
		 * 旧账没有这一格,走**证据 → 步骤 → 命题**(`evidence.stepId` → `step.tests.hypotheses`)那条链。
		 */
		/** 一个步骤检验的命题 id(新形状 `tests.hypotheses`;旧形状单条 `tests.hypothesis` 照旧认)。 */
		function testedOf(meta) {
			const tests = meta?.tests
			if (Array.isArray(tests?.hypotheses)) return tests.hypotheses
			return typeof tests?.hypothesis === 'string' && tests.hypothesis !== '' ? [tests.hypothesis] : []
		}

		function evidenceOf(data, hypothesisId) {
			/**
			 * 走**跨计划**的步骤索引:命题的验证步常常留在**已收尾的旧计划**里
			 * (真数据:两条计划,`tests` 全在旧的那条上)⇒ 只查活动计划会全断,
			 * 面板上五个命题的证据与判者全是「—」。索引由折法派生,不新增存储。
			 */
			const index = data?.stepIndex ?? {}
			const steps = new Set(
				Object.entries(index)
					.filter(([, meta]) => testedOf(meta).includes(hypothesisId))
					.map(([stepId]) => stepId),
			)
			return (data?.evidence ?? [])
				.filter((item) => (item.hypothesis === null || item.hypothesis === undefined ? steps.has(item.stepId) : item.hypothesis === hypothesisId))
				.slice()
				.sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
		}

		/**
		 * 一条证据的**出处**。分两层:
		 *
		 *   ① **记账时定下的 `origins` 优先** —— 四类入口(产物 / 评估卡 / 评估者子会话 / 人放行)
		 *      是内核在写证据那一刻解析好的事实,界面只渲染;
		 *   ② 旧日志没有 `origins` 时走**只读回退**:材料 id → 材料表里的路径,换不出来的**丢掉** ——
		 *      绝不把裸 id 渲染成"能点"的样子(失效模式:整排出处因此点不开)。
		 */
		const ORIGIN_LABEL = lazyTable(() => ({ 'audit-card': t('评估卡'), 'evaluator-session': t('查看评估者'), 'approval-record': t('审批记录') }))
		/**
		 * 出处的**可点标签**:产物用**文件名**,不用「产物」三个字 ——
		 * 一条证据常常挂着两三个产物,都叫「产物」就没人知道该点谁。
		 * 同名不同目录时才补路径片段(仍然是"一眼能认出点的是哪个")。
		 */
		function fileLabel(path, others) {
			const text = String(path ?? '')
			if (text === '') return t('产物')
			const name = text.split('/').filter(Boolean).pop() ?? text
			const sameName = (others ?? []).filter((other) => String(other ?? '').split('/').filter(Boolean).pop() === name)
			if (sameName.length <= 1) return name
			// 有重名:带上最后一层目录(products/report.md → products/report.md)
			const parts = text.split('/').filter(Boolean)
			return parts.length >= 2 ? parts.slice(-2).join('/') : text
		}
		function originsOf(data, item) {
			if (Array.isArray(item.origins) && item.origins.length > 0) {
				const paths = item.origins.filter((origin) => origin.kind === 'artifact').map((origin) => origin.path)
				return item.origins.map((origin) => ({
					kind: origin.kind,
					label: origin.kind === 'artifact' ? fileLabel(origin.path, paths) : (ORIGIN_LABEL[origin.kind] ?? origin.kind),
					path: typeof origin.path === 'string' && origin.path !== '' ? origin.path : null,
					session: typeof origin.session === 'string' && origin.session !== '' ? origin.session : null,
					call: typeof origin.call === 'string' && origin.call !== '' ? origin.call : null,
				}))
			}
			const materials = new Map((data?.materials ?? []).map((row) => [row.id, row.ref]))
			const asPath = (ref) => {
				const text = String(ref ?? '').trim()
				if (text === '') return null
				if (materials.has(text)) return String(materials.get(text))
				return /[/.]/.test(text) ? text : null
			}
			const out = []
			if (item.anchor === 'auditor') {
				/**
				 * 评估卡按**步骤**归属;世界线证据的卡按 `分支` 归属(形如 `k-…:b-…`),
				 * 与证据的 `stepId` 不是同一个 id —— 所以两种都要认(只认 stepId 时,
				 * 世界线的五条独立证据一条都指不到卡)。
				 */
				const audits = (data?.audits ?? []).filter((row) => row.evaluator === 'independent')
				const audit =
					audits.find((row) => row.stepId === item.stepId) ??
					(item.branch === null || item.branch === undefined ? undefined : audits.find((row) => String(row.stepId ?? '').endsWith(`:${item.branch}`)))
				if (audit?.cardPath !== null && audit?.cardPath !== undefined) out.push({ kind: 'audit-card', label: t('评估卡'), path: String(audit.cardPath) })
				if (audit?.evaluatorSession !== null && audit?.evaluatorSession !== undefined) out.push({ kind: 'evaluator-session', label: t('查看评估者'), session: String(audit.evaluatorSession) })
			}
			const fallbackPaths = (item.refs ?? []).map((ref) => asPath(ref)).filter((path) => path !== null)
			for (const ref of item.refs ?? []) {
				const path = asPath(ref)
				if (path !== null) out.push({ kind: 'artifact', label: fileLabel(path, fallbackPaths), path })
			}
			const released = (data?.releases ?? []).find((row) => row.step === item.stepId)
			if (released !== undefined) out.push({ kind: 'approval-record', label: t('审批记录'), path: null, call: released.call ?? null })
			return out
		}

		/**
		 * 一条**事实**的证据落在哪一步(纯函数:可单测)。
		 *
		 * 为什么需要:会话结案后命题已升格为事实、离开命题货架 ⇒ 命题 drill 里那条
		 * 「在世界树里看这一步」就够不着了 ✗。事实这一层同样要能跳回它那一步。
		 */
		function stepOfFact(data, fact) {
			for (const id of fact?.evidenceIds ?? []) {
				const item = (data?.evidence ?? []).find((entry) => entry.id === id)
				const stepId = item?.stepId
				if (typeof stepId === 'string' && stepId !== '') return stepId
			}
			return null
		}

		/**
		 * ═══ 本体格(第六阶段:图为主) ═══
		 *
		 * 一屏三层,自上而下越来越细:
		 *   ① 页眉:在回答什么 · 一行计数 · 待处理(只陈述)· 迷你进度轨(判断 → 检验 → 已验证 → 入本体);
		 *   ② 图:本体图 / 实体图二选一,星图式(点 + 衬线标签;实线已验证、虚线待核验);
		 *   ③ 结论:一行一条,按可信度分组;点开依次是 进度 → 可信度怎么变的 → 补充。
		 *
		 * 用词与运行态卡**同一套**(`knowledge-view.js` 的 TRUST / VERDICT_WORD / LEVEL_WORD):
		 * 单次检验的结果是 支持 / 推翻 / 不确定;一条结论的状态是 已验证 / 待核验 / 验证中 / 不确定 / 已推翻 / 已替换。
		 * 内部编号(h-… / e-… / s-…)不上屏:人认的是短名和「第几步」。
		 */
		const TRUST_ORDER = ['credible', 'pending', 'testing', 'unclear', 'refuted', 'replaced']
		const TRUST_WORD = lazyTable(() => ({ credible: t('已验证'), pending: t('待核验'), testing: t('验证中'), unclear: t('不确定'), refuted: t('已推翻'), replaced: t('已替换') }))
		const LEVEL_WORD = lazyTable(() => ({ L0: t('自行检验'), L1: t('自行检验'), L2: t('自行检验'), L3: t('独立核验'), L4: t('人工批准') }))
		/** 进度轨的四站。顺序即一条结论要走的路。 */
		const STATIONS = () => [t('判断'), t('检验'), t('已验证'), t('纳入本体')]
		/** 还没走完时,下一步是什么(时间线末尾那条虚点)。 */
		const NEXT_STEP = lazyTable(() => ({
			testing: t('下一步:安排步骤对其进行检验'),
			pending: t('下一步:通过独立核验后标记为已验证'),
			unclear: t('下一步:改用其他方法重新检验'),
			credible: t('下一步:结案时写入长期知识'),
		}))
		/** 值的形态(本体图上的小方块):内部词换成人话。 */
		const FORM_WORD = lazyTable(() => ({ statement: t('陈述'), quantity: t('数值'), formula: t('公式'), code: t('代码'), reference: t('引用') }))
		const KIND_WORD = lazyTable(() => ({ concept: t('概念'), value_type: t('取值形态'), instance: t('实例'), literal: t('取值'), edge: t('关系') }))

		/** 一步检验是怎么做的:独立核验直接说;自己做的,说到了哪一级(可复算 / 引用材料 / 推了一遍)。 */
		const howOf = (row) => (row.evaluator === 'independent' ? t('独立核验') : (LEVEL_WORD[row.level] ?? t('自行检验')))

		/**
		 * **结论行的模型**(纯函数,导出给测试)。
		 *
		 * 一条判断一行;旧账本里没有判断关联的事实也各占一行(它们已经写进长期知识,只是不知道出自哪条判断)。
		 * 站位:写进长期知识 = 4,已验证 = 3,检验过 = 2,只是提出 = 1;被推翻的停在「检验」那一站。
		 */
		function conclusionsOf(data) {
			const facts = Array.isArray(data?.facts) ? data.facts : []
			const ordinalOf = new Map()
			for (const plan of [...(Array.isArray(data?.plans) ? data.plans : []), ...(data?.plan ? [data.plan] : [])]) {
				for (const step of plan?.steps ?? []) if (typeof step?.id === 'string') ordinalOf.set(step.id, step.ordinal ?? null)
			}
			const testingStep = (id) => {
				for (const [stepId, meta] of Object.entries(data?.stepIndex ?? {})) if (testedOf(meta).includes(id)) return ordinalOf.get(stepId) ?? null
				return null
			}
			const linked = new Set()
			const rows = (Array.isArray(data?.goal?.hypotheses) ? data.goal.hypotheses : []).map((hypothesis) => {
				const history = Array.isArray(hypothesis.history) ? hypothesis.history : []
				const fact = facts.find((item) => item.hypothesis === hypothesis.id) ?? null
				if (fact !== null) linked.add(fact.id)
				const lastEvidence = [...history].reverse().find((row) => row.kind === 'evidence') ?? null
				const promoted = fact !== null && fact.review?.decision !== 'retracted'
				const trust = TRUST_ORDER.includes(hypothesis.trust) ? hypothesis.trust : 'testing'
				const station = trust === 'refuted' ? 2 : promoted ? 4 : trust === 'credible' ? 3 : lastEvidence !== null ? 2 : 1
				return {
					key: hypothesis.id,
					hypothesis: hypothesis.id,
					name: String(hypothesis.name ?? ''),
					claim: String(hypothesis.claim ?? ''),
					trust,
					station,
					history,
					refuteWhen: hypothesis.refuteWhen ?? null,
					scope: fact?.scope ?? hypothesis.fact?.scope ?? null,
					basis: lastEvidence?.basis ?? null,
					evidenceId: lastEvidence?.id ?? null,
					step: lastEvidence?.ordinal ?? testingStep(hypothesis.id),
					assertions: fact?.assertions ?? hypothesis.assertions ?? null,
					fact: fact?.id ?? null,
				}
			})
			for (const fact of facts) {
				if (linked.has(fact.id)) continue
				const trust = fact.review?.decision === 'retracted' ? 'replaced' : fact.refuted === true ? 'refuted' : 'credible'
				rows.push({
					key: fact.id,
					hypothesis: null,
					name: '',
					claim: String(fact.text ?? ''),
					trust,
					station: trust === 'credible' ? 4 : 2,
					history: [{ kind: 'promoted', at: fact.at ?? null, level: fact.level ?? null, to: 'credible' }],
					refuteWhen: null,
					scope: fact.scope ?? null,
					basis: null,
					evidenceId: (fact.evidenceIds ?? [])[0] ?? null,
					step: null,
					assertions: fact.assertions ?? null,
					fact: fact.id,
				})
			}
			return rows
		}

		/** 短名与主张重复时只说一遍(没起短名的旧判断,短名就是主张的开头)。 */
		const titleOf = (row) => {
			const name = row.name.trim()
			if (name === '' || name.endsWith('…') || row.claim.startsWith(name)) return { title: brief(row.claim, 40), sub: null }
			return { title: name, sub: brief(row.claim, 60) }
		}

		/** 状态小签:实心 = 已验证,描边 = 待核验,淡描边 = 验证中,虚边 = 不确定,红 = 已推翻,删除线 = 已替换。 */
		function TrustTag(props) {
			return h('span', { className: 'clearai-trust', 'data-trust': props.trust }, TRUST_WORD[props.trust] ?? props.trust)
		}

		/** 四站进度条:走过的实心,在路上的那一段斜纹,当前站名加粗。 */
		function StationBar(props) {
			const reached = props.station
			const stopped = props.trust === 'refuted' || props.trust === 'replaced'
			const names = STATIONS()
			return h(
				'div',
				{ className: 'clearai-stations', 'data-stopped': stopped ? '1' : '0' },
				h(
					'div',
					{ className: 'clearai-stations-bar' },
					...names.map((_, index) => h('span', { key: `seg-${index}`, 'data-state': index < reached ? (stopped && index === reached - 1 ? 'broken' : 'done') : index === reached && !stopped ? 'next' : 'todo' })),
				),
				h('div', { className: 'clearai-stations-names' }, ...names.map((name, index) => h('span', { key: `name-${index}`, 'data-now': index === reached - 1 ? '1' : '0' }, name))),
				stopped ? h('div', { className: 'clearai-stations-note' }, props.trust === 'refuted' ? t('在检验阶段被推翻,不再推进。') : t('已被替换,不再推进。')) : null,
			)
		}

		/** 可信度怎么变的:一笔一行,变了的那一笔写出「之前 → 之后」。 */
		function TrustTimeline(props) {
			const rows = props.history
			const lines = rows.map((row, index) => {
				let text = ''
				if (row.kind === 'proposed') text = t('提出')
				else if (row.kind === 'evidence') text = `${row.ordinal === null || row.ordinal === undefined ? t('单步检验') : `${nth(row.ordinal)}`}${t(':')}${VERDICT[row.verdict] ?? row.verdict} · ${howOf(row)}`
				else if (row.kind === 'promoted') text = t('写入长期知识')
				else if (row.kind === 'retracted') text = `${t('人工撤回')}${row.reason ? `:${brief(row.reason, 40)}` : ''}`
				const moved = row.from !== undefined && row.from !== row.to
				return h(
					'div',
					{ key: `tl-${index}`, className: 'clearai-tl-row', 'data-kind': row.kind, 'data-verdict': row.verdict ?? '' },
					h('span', { className: 'clearai-tl-dot' }),
					h('span', { className: 'clearai-tl-time' }, when(row.at)),
					h('span', null, text, moved ? h('b', { className: 'clearai-tl-move' }, ` · ${TRUST_WORD[row.from] ?? row.from} → ${TRUST_WORD[row.to] ?? row.to}`) : null),
				)
			})
			const next = props.station >= 4 || props.trust === 'refuted' || props.trust === 'replaced' ? null : (NEXT_STEP[props.trust] ?? null)
			if (next !== null) lines.push(h('div', { key: 'tl-next', className: 'clearai-tl-row', 'data-kind': 'next' }, h('span', { className: 'clearai-tl-dot' }), h('span', { className: 'clearai-tl-time' }, ''), h('span', null, next)))
			return h('div', { className: 'clearai-tl' }, ...lines)
		}

		/** 点开一条:进度 → 可信度怎么变的 → 补充,依次往下。 */
		function ConclusionDetail(props) {
			const { row, data } = props
			const evidence = row.evidenceId === null ? null : ((data?.evidence ?? []).find((item) => item.id === row.evidenceId) ?? null)
			const origins = evidence === null ? [] : originsOf(data, evidence)
			const subjects = [...new Set((Array.isArray(row.assertions) ? row.assertions : []).map((assertion) => String(assertion?.subject?.id ?? '')).filter((id) => id !== ''))]
			const part = (index, title, body) => h('div', { className: 'clearai-part' }, h('div', { className: 'clearai-part-head' }, h('b', null, String(index)), title), body)
			const kv = (label, value) => (value === null || value === undefined || value === '' ? [] : [h('span', { key: `k-${label}` }, label), h('span', { key: `v-${label}` }, value)])
			return h(
				'div',
				{ className: 'clearai-detail' },
				part(1, t('进度'), h(StationBar, { station: row.station, trust: row.trust })),
				part(2, t('可信度变化'), h(TrustTimeline, { history: row.history, station: row.station, trust: row.trust })),
				part(
					3,
					t('补充说明'),
					h(
						'div',
						{ className: 'clearai-kv' },
						...kv(
							t('依据'),
							row.basis === null
								? null
								: h(
										'span',
										null,
										h('span', { title: String(row.basis) }, brief(row.basis, 120)),
										...origins
											.filter((origin) => origin.path !== null || origin.session !== null)
											.slice(0, 2)
											.map((origin, index) =>
												h(
													'span',
													{
														key: `o-${index}`,
														className: 'clearai-link',
														style: { marginLeft: 8 },
														onClick: () => (origin.session !== null && origin.kind === 'evaluator-session' ? data.openSpectator?.(origin.session) : data.openPreview?.(origin.path)),
														title: origin.path ?? '',
													},
													origin.kind === 'audit-card' || origin.kind === 'evaluator-session' ? t('查看核验') : t('查看记录'),
												),
											),
									),
						),
						...kv(t('范围'), row.scope === row.refuteWhen ? null : row.scope),
						...kv(t('推翻条件'), row.refuteWhen),
						...kv(
							t('相关'),
							subjects.length === 0
								? null
								: h('span', { className: 'clearai-chips' }, ...subjects.map((id) => h('span', { key: id, className: 'clearai-chip', onClick: () => props.onFocus?.(id), title: t('在图中定位') }, labelOfEntity(data, id)))),
						),
						...kv(t('来源'), row.step === null ? null : `${nth(row.step)}`),
					),
				),
			)
		}

		/** 实例在图上的名字(登记时给的 label);图上没有它就退回 id。 */
		const labelOfEntity = (data, id) => String((data?.lexicon?.graph?.nodes ?? []).find((node) => node.layer === 'entity' && String(node.ref ?? '') === id)?.label ?? id)

		/** 一条结论一行:状态签 + 短名(+ 主张)+ 出自第几步。 */
		function ConclusionRow(props) {
			const { row, open } = props
			const { title, sub } = titleOf(row)
			return h(
				'div',
				{ className: 'clearai-row', 'data-open': open ? '1' : '0', 'data-trust': row.trust },
				h(
					'div',
					{ className: 'clearai-row-head', onClick: () => props.onToggle(row.key), title: open ? t('收起') : t('点击查看进度与来源') },
					h(TrustTag, { trust: row.trust }),
					h('span', { className: 'clearai-row-title' }, title),
					sub === null ? null : h('span', { className: 'clearai-row-sub' }, sub),
					h('span', { className: 'clearai-row-step' }, row.step === null ? '' : `${nth(row.step)}`),
				),
				open ? h(ConclusionDetail, { row, data: props.data, onFocus: props.onFocus }) : null,
			)
		}

		/** 结论列表:按可信度分组,空组不出现。 */
		function ConclusionList(props) {
			const rows = props.rows
			if (rows.length === 0) return h('div', { className: 'clearai-quiet' }, props.empty ?? t('暂无结论。模型提出判断后,将在此逐条列出。'))
			return h(
				'div',
				{ className: 'clearai-list' },
				...TRUST_ORDER.map((trust) => {
					const group = rows.filter((row) => row.trust === trust)
					if (group.length === 0) return null
					return h(
						'div',
						{ key: trust, className: 'clearai-group' },
						h('div', { className: 'clearai-group-head' }, TRUST_WORD[trust], h('span', null, String(group.length))),
						...group.map((row) => h(ConclusionRow, { key: row.key, row, open: props.open === row.key, onToggle: props.onToggle, data: props.data, onFocus: props.onFocus })),
					)
				}),
			)
		}

		/** 页眉:在回答什么(计数、待处理与进度轨归探索货架)。 */
		function AtlasHeader(props) {
			const { data } = props
			return h(
				'div',
				{ className: 'clearai-head' },
				h('div', { className: 'clearai-question', title: String(data?.goal?.claim ?? '') }, data?.goal ? String(data.knowledgeView?.goal?.headline ?? data.goal.claim ?? '') : t('尚未设立目标')),
			)
		}

		/**
		 * **本体格**(中栏视图)。
		 *
		 * 取数与从前一样:宿主半的会话投影单元 `clearai` 由插座作为 `useProjection` 交下来。
		 * 界面状态(图层、全屏、选中、展开哪条、只看哪个词)全是界面的事,一个字节都不进账本。
		 */
		function Atlas(props) {
			const projected = typeof props.useProjection === 'function' ? props.useProjection('clearai') : undefined
			const [manual, setManual] = React.useState(null)
			const [layer, setLayer] = React.useState('ontology')
			const [workspace, setWorkspace] = React.useState(false)
			const [filter, setFilter] = React.useState(null)
			const [focusNode, setFocusNode] = React.useState(null)
			const incoming = useFocus(factsFocus)
			/** 样式表由 `apply` 挂;面板被单独挂载(截图、预览)时也自己挂一次——同一个标记,不会挂两份。 */
			React.useEffect(() => {
				installStyles()
			}, [])
			if (projected === undefined || projected === null) {
				return h('div', { className: 'clearai-atlas' }, h(Empty, null, t('暂无内容。发送第一条消息后,此处将显示本体图与结论。')))
			}
			const data = { ...projected, openPreview: props.openPreview, openSpectator: props.openSpectator }
			/** 本体货架只放结果:已确立的事实(判断的全部过程在探索货架的「过程记录」里)。 */
			const rows = conclusionsOf(data).filter((row) => row.trust === 'credible')
			const lexicon = data.lexicon ?? null
			/** 世界树那边点进来的聚焦优先;手动点行仍然有效。 */
			const focused = incoming === null || incoming === undefined ? null : propositionForStep(data, incoming.step)
			const open = focused ?? manual
			const filterTerm = filter === null ? null : ((lexicon?.terms ?? []).find((item) => item.id === filter) ?? (lexicon?.predicates ?? []).find((item) => item.id === filter) ?? { id: filter, label: filter, aliases: [] })
			const shown = filterTerm === null ? rows : rows.filter((row) => termMatches(filterTerm, row))
			const gaps = Array.isArray(data.knowledge?.gaps) ? data.knowledge.gaps : []
			const unlandedRow = gaps.find((gap) => gap?.code === 'entities_unlanded')
			return h(
				'div',
				{ className: 'clearai-atlas' },
				h(AtlasHeader, { data }),
				h(AnswerCards, { data, openExplore: props.openExplore }),
				h(GraphBand, {
					lexicon,
					data,
					send: props.send,
					layer,
					unlanded: typeof unlandedRow?.count === 'number' ? unlandedRow.count : null,
					onLayer: setLayer,
					onFilter: (id) => setFilter(filter === id ? null : id),
					focus: focusNode,
					sessionId: data.sessionId,
					fullscreen: workspace,
					onToggleFullscreen: () => setWorkspace(workspace !== true),
				}),
				filterTerm === null
					? null
					: h(
							'div',
							{ className: 'clearai-filter' },
							`${t('仅显示与「')}${String(filterTerm.label ?? filterTerm.id)}${t('」相关的内容')}${t(':')}${shown.length}/${rows.length}`,
							h('span', { className: 'clearai-link', onClick: () => setFilter(null) }, t('清除')),
						),
				h('div', { className: 'clearai-section-head' }, t('已确立的事实')),
				h(ConclusionList, {
					rows: shown,
					empty: t('暂无已确立的事实。判断经检验与独立核验后,将在此列出;检验过程见探索货架。'),
					open,
					data,
					onToggle: (key) => {
						factsFocus.set(null)
						setManual(open === key ? null : key)
					},
					onFocus: (id) => {
						const node = (lexicon?.graph?.nodes ?? []).find((item) => item.layer === 'entity' && String(item.ref ?? '') === id)
						if (node !== undefined) {
							setLayer('entity')
							setFocusNode(node.id)
						}
					},
				}),
				(data.lessons ?? []).length === 0 ? null : h('div', { className: 'clearai-section-head' }, `${t('经验(')}${data.lessons.length}${t(')')}`),
				h(LessonList, { data }),
			)
		}

		/**
		 * **探索货架**(中栏视图,紧挨「本体」):过程在这里,结果在本体货架。
		 *
		 * 主轴是 问题 → 候选假设(定向求解)或 调研板块 → 新发现的问题(广度调研),
		 * 读的是宿主算好的 `exploration`(与运行态卡上「当前位置」同一份派生)。
		 * 候选的状态只从证据来;界面不写任何状态。「立为问题 / 暂缓」两个按钮只是**替人发一句话**
		 * 给模型,由模型用 Frame 修订落账——与「要改什么就在对话里说」是同一条路。
		 */
		const MODE_WORD = lazyTable(() => ({ survey: t('广度调研'), solve: t('定向求解'), survey_then_solve: t('先调研后求解') }))
		const CANDIDATE_WORD = lazyTable(() => ({ examining: t('考察中'), excluded: t('已排除'), adopted: t('已采纳'), set_aside: t('暂不考察') }))
		const AREA_WORD = lazyTable(() => ({ not_started: t('未开始'), in_progress: t('调研中'), clear: t('已厘清') }))
		const LESSON_WORD = lazyTable(() => ({ trap: t('常见误区'), check: t('前置核查'), shortcut: t('不可取的捷径'), prior: t('先验知识') }))


		/** 一条候选最近一条某种结论的依据(排除依据 / 采纳依据都从证据里来)。 */
		const latestBasis = (data, hypothesis, verdict) => {
			const rows = (Array.isArray(data?.evidence) ? data.evidence : []).filter((item) => item.hypothesis === hypothesis && item.verdict === verdict)
			return rows.length === 0 ? null : String(rows[rows.length - 1].basis ?? '') || null
		}

		/** 候选假设展开后的几行(标签按界面用语规范:引用的已有知识 / 主张 / 推翻条件 / 预测 / 排除依据 / 采纳依据 / 关联记录)。 */
		function candidateDetail(data, candidate, prediction) {
			const rows = []
			const push = (label, value) => {
				if (value !== null && value !== undefined && value !== '') rows.push([label, value])
			}
			/** 引用的已有条目与系统的判定(取代原来的「提出依据」):判断写了 `uses` 才有。 */
			const hypothesis = (Array.isArray(data?.goal?.hypotheses) ? data.goal.hypotheses : []).find((item) => item.id === candidate.id)
			const uses = Array.isArray(hypothesis?.uses) ? hypothesis.uses : []
			const byKey = itemsByKey(data)
			push(t('引用的已有知识'), uses.length === 0 ? null : uses.map((use) => `${byKey.get(`${use.kind}:${use.id}`)?.text ? brief(byKey.get(`${use.kind}:${use.id}`).text, 40) : use.id}(${VERDICT_WORD[use.verdict] ?? use.verdict})`).join(t('、')))
			push(t('主张'), candidate.claim !== candidate.name ? candidate.claim : null)
			push(t('推翻条件'), candidate.refuteWhen)
			push(t('预测'), prediction)
			if (candidate.state === 'excluded') push(t('排除依据'), latestBasis(data, candidate.id, 'refute'))
			if (candidate.state === 'adopted') push(t('采纳依据'), latestBasis(data, candidate.id, 'support'))
			const support = (Array.isArray(data?.evidence) ? data.evidence : []).filter((item) => item.hypothesis === candidate.id && item.verdict === 'support').length
			push(t('关联记录'), `${t('支持 ')}${support}${t(' 条 · 推翻 ')}${candidate.refutations}${t(' 条 · 无法判定 ')}${candidate.inconclusive}${t(' 条')}`)
			return rows
		}

		/** 状态小签:候选与板块各用自己的一套词,颜色按状态族走(进行中 / 否定 / 肯定 / 搁置)。 */
		function StateTag(props) {
			return h('span', { className: 'clearai-state', 'data-s': props.state }, props.children)
		}

		/** 一个问题:标题、计数、候选列表(可展开)、暂不考察的放在页脚。 */
		function QuestionBox(props) {
			const { data, question, index, next, open, onToggle } = props
			const shown = question.candidates.filter((candidate) => candidate.state !== 'set_aside')
			const parked = question.candidates.filter((candidate) => candidate.state === 'set_aside')
			const counts = ['examining', 'excluded', 'adopted'].filter((key) => (question.counts?.[key] ?? 0) > 0).map((key) => `${CANDIDATE_WORD[key]} ${question.counts[key]}`)
			const predictionOf = (id) => (next?.predictions ?? []).find((item) => item.hypothesis === id)?.expect ?? null
			const status =
				question.status === 'answered'
					? h('span', { className: 'clearai-link', onClick: () => props.openFacts?.(), title: t('在本体货架中展开此结论') }, t('已得出结论 · 查看结论'))
					: question.status === 'parked'
						? h('span', null, t('已暂缓'))
						: question.status === 'emergent'
							? h('span', null, t('新发现,待您决定'))
							: h('span', null, shown.length === 0 ? t('尚无候选假设') : `${t('候选假设 ')}${question.candidates.length}${t(' 个:')}${counts.join(' · ')}`)
			const compact = shown.length === 0 && question.status !== 'emergent'
			return h(
				'section',
				{ className: 'clearai-box', 'data-compact': compact ? '1' : '0', 'data-current': props.current ? '1' : '0' },
				h(
					'div',
					{ className: 'clearai-box-head' },
					question.implicit ? null : h('span', { className: 'clearai-box-kind' }, `${t('问题 ')}${index + 1}`),
					h('span', { className: 'clearai-box-title' }, question.implicit ? t('候选假设') : question.text),
					h('span', { className: 'clearai-box-note' }, status),
				),
				question.status === 'emergent' ? h(EmergentActions, { question, send: props.send, sent: props.sent, onSent: props.onSent }) : null,
				...shown.map((candidate) => {
					const isOpen = open === candidate.id
					return h(
						'div',
						{ key: candidate.id, className: 'clearai-cand', 'data-open': isOpen ? '1' : '0', 'data-s': candidate.state },
						h(
							'button',
							{ type: 'button', className: 'clearai-cand-head', 'aria-expanded': isOpen ? 'true' : 'false', onClick: () => onToggle(isOpen ? null : candidate.id) },
							h(StateTag, { state: candidate.state }, CANDIDATE_WORD[candidate.state] ?? candidate.state),
							h('span', { className: 'clearai-cand-name' }, candidate.name),
							candidate.claim !== candidate.name ? h('span', { className: 'clearai-cand-note' }, brief(candidate.claim, 80)) : null,
							h('span', { className: 'clearai-cand-chevron', 'aria-hidden': 'true' }, isOpen ? t('收起') : t('展开')),
						),
						isOpen
							? h(
									'div',
									{ className: 'clearai-cand-detail' },
									...candidateDetail(data, candidate, predictionOf(candidate.id)).map(([label, value]) => h('div', { key: label, className: 'clearai-kvrow' }, h('span', null, label), h('span', null, value))),
								)
							: null,
					)
				}),
				parked.length === 0
					? null
					: h(
							'div',
							{ className: 'clearai-box-foot' },
							...parked.map((candidate) => h('span', { key: candidate.id, className: 'clearai-parked' }, h(StateTag, { state: 'set_aside' }, CANDIDATE_WORD.set_aside), h('s', null, candidate.name))),
						),
			)
		}

		/**
		 * 「立为问题 / 暂缓」:替人发一句话给模型(模型用 Frame 修订落账),界面自己不写状态。
		 * 发不出去(拿不到会话的对话服务)就如实说请在对话中说明,不假装发了。
		 */
		function EmergentActions(props) {
			const { question } = props
			const sent = props.sent?.[question.id] ?? null
			if (sent === 'pursue') return h('div', { className: 'clearai-emergent-done' }, t('已请求立为问题,待模型修订立题后生效。'))
			if (sent === 'park') return h('div', { className: 'clearai-emergent-done' }, t('已请求暂缓,结案时列入「尚未确定的事项」。'))
			if (sent === 'failed') return h('div', { className: 'clearai-emergent-done' }, t('无法自动发送,请在对话中说明。'))
			const ask = (kind, text) => props.onSent?.(question.id, typeof props.send === 'function' && props.send(text) === true ? kind : 'failed')
			return h(
				'div',
				{ className: 'clearai-emergent' },
				h('span', { className: 'clearai-emergent-kind' }, t('新发现的问题')),
				h('span', { className: 'clearai-emergent-text' }, question.text),
				h(
					'span',
					{ className: 'clearai-emergent-actions' },
					h('button', { type: 'button', className: 'clearai-btn', 'data-primary': '1', onClick: () => ask('pursue', `${t('请将新发现的问题「')}${question.text}${t('」立为问题深入研究(问题 ')}${question.id}${t(')。')}`) }, t('立为问题')),
					h('button', { type: 'button', className: 'clearai-btn', onClick: () => ask('park', `${t('请暂缓问题「')}${question.text}${t('」(问题 ')}${question.id}${t('),结案时列入「尚未确定的事项」。')}`) }, t('暂缓')),
				),
			)
		}

		/** 广度调研:调研板块一行一个,板块下挂新发现的问题。 */
		function AreaBox(props) {
			const { exploration } = props
			const areas = exploration.areas ?? []
			const counts = ['clear', 'in_progress', 'not_started'].map((key) => [key, areas.filter((area) => area.state === key).length]).filter(([, count]) => count > 0)
			return h(
				'section',
				{ className: 'clearai-box' },
				h('div', { className: 'clearai-box-head' }, h('span', { className: 'clearai-box-title' }, t('调研板块')), h('span', { className: 'clearai-box-note' }, counts.map(([key, count]) => `${AREA_WORD[key]} ${count}`).join(' · '))),
				...areas.map((area) => {
					const emergent = (exploration.questions ?? []).filter((question) => question.area === area.id && question.status === 'emergent')
					const note = [`${t('判断 ')}${area.judgments}${t(' 条 · 已采纳 ')}${area.verified}${t(' 条')}`, area.openAnomalies > 0 ? `${t('未解释的现象 ')}${area.openAnomalies}${t(' 项')}` : null].filter((item) => item !== null).join(' · ')
					return h(
						'div',
						{ key: area.id, className: 'clearai-cand', 'data-s': area.state },
						h('div', { className: 'clearai-cand-head', 'data-static': '1' }, h(StateTag, { state: area.state }, AREA_WORD[area.state] ?? area.state), h('span', { className: 'clearai-cand-name' }, area.name), h('span', { className: 'clearai-cand-note' }, note)),
						...emergent.map((question) => h(EmergentActions, { key: question.id, question, send: props.send, sent: props.sent, onSent: props.onSent })),
					)
				}),
			)
		}

		/** 下一步:做什么,以及各候选的预测;预测相同就如实说这一步区分不了。 */
		function NextBox(props) {
			const next = props.next
			if (next === null || next === undefined) return null
			const predictions = Array.isArray(next.predictions) ? next.predictions : []
			return h(
				'section',
				{ className: 'clearai-next' },
				h('div', { className: 'clearai-next-head' }, h('span', { className: 'clearai-next-kind' }, t('下一步')), h('span', { className: 'clearai-next-title' }, `${nth(next.ordinal)}${t(':')}${next.do}`)),
				predictions.length === 0
					? next.expect
						? h('div', { className: 'clearai-next-note' }, `${t('预测:')}${next.expect}`)
						: null
					: h(
							'div',
							{ className: 'clearai-preds' },
							...predictions.map((item, index) => h('div', { key: `p-${index}`, className: 'clearai-pred' }, h('div', { className: 'clearai-pred-if' }, `${t('若「')}${item.name}${t('」成立,预测')}`), h('div', { className: 'clearai-pred-value' }, item.expect))),
						),
				next.indistinct === true
					? h('div', { className: 'clearai-next-warn' }, t('各候选假设的预测相同,此步骤无法区分它们。'))
					: h('div', { className: 'clearai-next-note' }, t('如需调整计划,请在对话中说明。')),
			)
		}

		/** 未解释的现象:开着的逐条列出(结案时必须写进「尚未确定的事项」或先有去处)。 */
		function AnomalyBox(props) {
			const open = (Array.isArray(props.data?.anomalies) ? props.data.anomalies : []).filter((item) => item.status === 'open')
			if (open.length === 0) return null
			return h(
				'section',
				{ className: 'clearai-box' },
				h('div', { className: 'clearai-box-head' }, h('span', { className: 'clearai-box-title' }, `${t('未解释的现象(')}${open.length}${t(')')}`), h('span', { className: 'clearai-box-note' }, t('结案前须解释、排除或写入「尚未确定的事项」'))),
				...open.map((item) =>
					h(
						'div',
						{ key: item.id, className: 'clearai-anomaly' },
						h('span', null, item.what),
						item.by === 'evaluator' ? h('span', { className: 'clearai-anomaly-meta' }, t('独立评估发现')) : null,
						(item.touches ?? []).length > 0 ? h('span', { className: 'clearai-anomaly-meta' }, `${t('涉及:')}${item.touches.join(t('、'))}`) : null,
					),
				),
			)
		}

		/** 判断的计数与四站进度轨(原在本体货架页眉;过程信息归探索货架)。 */
		function JudgmentSummary(props) {
			const rows = props.rows
			const live = rows.filter((row) => row.trust !== 'replaced')
			const counts = TRUST_ORDER.filter((trust) => trust !== 'replaced')
				.map((trust) => [trust, rows.filter((row) => row.trust === trust).length])
				.filter(([, count]) => count > 0)
			const stations = STATIONS().map((name, index) => [name, live.filter((row) => row.station >= index + 1).length])
			return h(
				'div',
				{ className: 'clearai-judgments-head' },
				counts.length === 0 ? null : h('div', { className: 'clearai-counts' }, counts.map(([trust, count]) => `${TRUST_WORD[trust]} ${count}`).join(' · ')),
				live.length === 0
					? null
					: h(
							'div',
							{ className: 'clearai-track' },
							...stations.flatMap(([name, count], index) => [
								index === 0 ? null : h('span', { key: `line-${index}`, className: 'clearai-track-line', 'data-on': count > 0 ? '1' : '0' }),
								h('span', { key: `st-${index}`, className: 'clearai-track-stop', 'data-on': count > 0 ? '1' : '0' }, h('i', null), `${name} ${count}`),
							]),
						),
			)
		}

		function ExploreView(props) {
			const projected = typeof props.useProjection === 'function' ? props.useProjection('clearai') : undefined
			const [open, setOpen] = React.useState(null)
			const [processOpen, setProcessOpen] = React.useState(false)
			const [manual, setManual] = React.useState(null)
			const [sent, setSent] = React.useState({})
			const incoming = useFocus(factsFocus)
			React.useEffect(() => {
				installStyles()
			}, [])
			if (projected === undefined || projected === null) return h('div', { className: 'clearai-atlas' }, h(Empty, null, t('暂无内容。发送第一条消息后,此处将显示问题、候选假设与下一步。')))
			const data = { ...projected, openPreview: props.openPreview, openSpectator: props.openSpectator }
			const exploration = data.exploration ?? null
			const goal = data.goal ?? null
			const rows = conclusionsOf(data)
			const openFacts = () => props.openFacts?.()
			const onSent = (id, kind) => setSent({ ...sent, [id]: kind })
			const focused = incoming === null || incoming === undefined ? null : propositionForStep(data, incoming.step)
			const opened = focused ?? manual
			const showProcess = processOpen || focused !== null
			if (goal === null) {
				return h('div', { className: 'clearai-atlas' }, h(Empty, null, t('尚未设立目标。模型立题后,此处将显示问题、候选假设与下一步。')))
			}
			const questions = Array.isArray(exploration?.questions) ? exploration.questions : []
			const declared = questions.filter((question) => !question.implicit)
			const areas = Array.isArray(exploration?.areas) ? exploration.areas : []
			const currentIndex = declared.findIndex((question) => question.id === exploration?.current)
			const plan = data.plan ?? null
			const steps = plan === null ? [] : (plan.steps ?? []).filter((step) => step.status !== 'void')
			const doneSteps = steps.filter((step) => step.status === 'advanced').length
			const chips = [
				exploration?.mode ? `${t('阶段 · ')}${MODE_WORD[exploration.mode] ?? exploration.mode}` : null,
				areas.length > 0 ? `${t('调研板块 ')}${areas.length}${t(' 个 · 已厘清 ')}${areas.filter((area) => area.state === 'clear').length}${t(' 个')}` : null,
				declared.length > 0 && currentIndex >= 0 ? `${t('当前问题 ')}${currentIndex + 1}${t(' / 共 ')}${declared.length}` : null,
				steps.length > 0 ? `${t('计划 已完成 ')}${doneSteps}${t(' / ')}${steps.length}${t(' 步')}` : null,
			].filter((item) => item !== null)
			const needYou = Array.isArray(data.needYou) ? data.needYou : []
			const audits = (Array.isArray(data.audits) ? data.audits : []).length
			const openAnomalies = (Array.isArray(data.anomalies) ? data.anomalies : []).filter((item) => item.status === 'open').length
			const running = steps.find((step) => step.status === 'open') ?? null
			const summary = [`${t('判断 ')}${rows.length}${t(' 条')}`, `${t('独立评估 ')}${audits}${t(' 次')}`, `${t('未解释的现象 ')}${openAnomalies}${t(' 项')}`, steps.length > 0 ? `${t('计划共 ')}${steps.length}${t(' 步')}${running === null ? '' : `${t('(')}${nth(running.ordinal)}${t('进行中)')}`}` : null].filter((item) => item !== null).join(' · ')
			const questionList = questions.filter((question) => question.implicit || question.area === null || question.area === undefined || question.status !== 'emergent')
			return h(
				'div',
				{ className: 'clearai-atlas' },
				h(
					'div',
					{ className: 'clearai-head' },
					h('div', { className: 'clearai-head-kind' }, t('课题')),
					h('div', { className: 'clearai-question', title: String(goal.claim ?? '') }, String(goal.headline ?? data.knowledgeView?.goal?.headline ?? goal.claim ?? '')),
					chips.length === 0 ? null : h('div', { className: 'clearai-pills' }, ...chips.map((chip, index) => h('span', { key: `c-${index}`, className: 'clearai-pill' }, chip))),
				),
				needYou.length === 0
					? null
					: h(
							'section',
							{ className: 'clearai-waiting' },
							h('b', null, `${t('待您处理(')}${needYou.length}${t(')')}`),
							...needYou.map((item, index) => h('span', { key: `need-${index}` }, String(item?.text ?? ''))),
						),
				areas.length > 0 ? h(AreaBox, { exploration, send: props.send, sent, onSent }) : null,
				...questionList.map((question) => h(QuestionBox, { key: question.id, data, question, index: declared.indexOf(question), current: question.id === exploration?.current, next: exploration?.next ?? null, open, onToggle: setOpen, openFacts, send: props.send, sent, onSent })),
				h(NextBox, { next: exploration?.next ?? null }),
				h(AnomalyBox, { data }),
				h(KnowledgeFlowBox, { data, openPreview: props.openPreview }),
				h(
					'section',
					{ className: 'clearai-process' },
					h(
						'button',
						{ type: 'button', className: 'clearai-process-head', 'aria-expanded': showProcess ? 'true' : 'false', onClick: () => {
							factsFocus.set(null)
							setProcessOpen(!showProcess)
						} },
						h('b', null, t('过程记录')),
						h('span', null, summary),
						h('span', { className: 'clearai-cand-chevron', 'aria-hidden': 'true' }, showProcess ? t('收起') : t('展开')),
					),
					showProcess
						? h(
								'div',
								{ className: 'clearai-process-body' },
								h(JudgmentSummary, { rows }),
								h(ConclusionList, {
									rows,
									open: opened,
									data,
									onToggle: (key) => {
										factsFocus.set(null)
										setManual(opened === key ? null : key)
									},
									onFocus: () => openFacts(),
								}),
								h(WorldTree, { data, openPreview: props.openPreview, openSpectator: props.openSpectator, openFacts: (stepId) => factsFocus.set({ step: stepId }) }),
							)
						: null,
				),
			)
		}

		/**
		 * **沉淀与取用**(0.5.2):条目、它在这次情形下是否适用、这次会留下什么。
		 * 读的是投影算好的 `knowledgeItems` / `entityKnowledge` / `knowledgeFlow`;界面不判定适用性,
		 * 条目上的按钮只替人向模型发一句话,由模型复检、撤回或修改后落账。
		 */
		const VERDICT_WORD = lazyTable(() => ({ applies: t('适用'), out_of_scope: t('超出适用范围'), out_of_range: t('超出取值范围'), undeclared: t('本次条件未声明'), unscoped: t('条目未声明适用范围'), definition_changed: t('口径已变更'), pending: t('待核验'), retracted: t('已撤回') }))
		const VERDICT_NEXT = lazyTable(() => ({ out_of_scope: t('本次不能直接沿用,需重新检验'), out_of_range: t('本次不能直接沿用,需重新检验'), undeclared: t('补充本次条件后重新判定'), unscoped: t('沿用时需自行确认'), definition_changed: t('按新口径换算或重新检验'), pending: t('先复检再沿用'), retracted: t('不得沿用') }))
		const ITEM_WORD = lazyTable(() => ({ established: t('已确立'), pending: t('待核验'), excluded: t('已排除'), preliminary_excluded: t('初步排除'), unresolved: t('未解释'), defect: t('测量或方法缺陷'), explained: t('已解释'), ruled_out: t('已判定无关'), escalated: t('已提交您处理') }))
		const COUNT_WORD = lazyTable(() => ({ established: t('已确立'), excluded: t('已排除'), bounded: t('超出适用范围'), pending: t('待核验'), unresolved: t('未解释') }))
		const COUNT_ORDER = ['established', 'excluded', 'bounded', 'pending', 'unresolved']

		/** 条目键(`kind:id`)→ 条目。 */
		const itemsByKey = (data) => new Map((Array.isArray(data?.knowledgeItems) ? data.knowledgeItems : []).map((item) => [`${item.kind}:${item.id}`, item]))

		/** 一条条目的出处:文件路径,没有就是 id。发给模型的话里用它,模型据此找到文件。 */
		const itemRef = (item) => String(item.path ?? item.id)

		/** 条目上的三个请求:只发一句话,不写任何状态。 */
		const ITEM_ASKS = () => [
			['retest', t('请求复检'), (item) => `${t('请复检条目「')}${item.text}${t('」(')}${itemRef(item)}${t(')。')}`],
			['retract', t('请求撤回'), (item) => `${t('请撤回条目「')}${item.text}${t('」(')}${itemRef(item)}${t('),并说明对已有结论的影响。')}`],
			['rescope', t('请求修改适用范围'), (item) => `${t('请与我确认条目「')}${item.text}${t('」(')}${itemRef(item)}${t(')的适用范围应如何修改。')}`],
		]

		function KnowledgeItemRow(props) {
			const { item } = props
			const meta = []
			if (item.scope) meta.push(`${t('范围:')}${item.scope}`)
			if (item.kind === 'negative' && item.strength && typeof item.strength.count === 'number') meta.push(`${t('推翻证据 ')}${item.strength.count}${t(' 条')}${item.strength.independent > 0 ? `${t(' · 独立核验 ')}${item.strength.independent}${t(' 条')}` : ''}`)
			if (item.basis) meta.push(`${t('依据')}${t(':')}${brief(item.basis, 80)}`)
			if (item.challenged === true) meta.push(t('受质疑'))
			for (const reason of item.rechecks ?? []) meta.push(`${reason.kind}: ${reason.detail ?? reason.model ?? ''}`)
			if ((item.rechecks ?? []).length) meta.push(item.recovery)
			const sent = props.sent ?? {}
			const [open, setOpen] = React.useState(false)
			const asks = props.asks === true && typeof props.send === 'function' && (open || props.open === true) ? ITEM_ASKS() : []
			const canAsk = props.asks === true && typeof props.send === 'function'
			const done = asks.find(([key]) => sent[`${item.kind}:${item.id}:${key}`] !== undefined)
			return h(
				'div',
				{ className: 'clearai-kitem', 'data-open': open ? '1' : '0' },
				h('div', { className: 'clearai-kitem-head', 'data-click': canAsk ? '1' : '0', title: canAsk ? (open ? t('收起') : t('点击查看可发出的请求')) : undefined, onClick: canAsk ? () => setOpen(!open) : undefined }, h(StateTag, { state: item.status }, item.kind === 'lesson' ? (LESSON_WORD[item.status] ?? item.status) : (ITEM_WORD[item.status] ?? item.status)), h('span', null, item.text), item.path ? h('span', { className: 'clearai-link', onClick: () => props.openPreview?.(item.path), title: item.path }, t('查看记录')) : null),
				meta.length === 0 ? null : h('div', { className: 'clearai-kitem-meta' }, meta.join(' · ')),
				...(item.rechecks ?? []).filter((reason) => reason.evidence).map((reason) => h('span', { className: 'clearai-link', onClick: () => props.openPreview?.(reason.evidence), title: reason.evidence }, t('查看核验'))),
				...(item.evidencePaths ?? []).map((path) => h('span', { className: 'clearai-link', onClick: () => props.openPreview?.(path), title: path }, t('查看核验'))),
				asks.length === 0
					? null
					: done !== undefined
						? h('div', { className: 'clearai-kitem-meta' }, sent[`${item.kind}:${item.id}:${done[0]}`] === 'failed' ? t('无法自动发送,请在对话中说明。') : t('已发送请求,由模型处理后更新。'))
						: h('div', { className: 'clearai-kitem-asks' }, ...asks.map(([key, label, say]) => h('button', { key, type: 'button', className: 'clearai-btn', 'data-small': '1', onClick: () => props.onSent?.(`${item.kind}:${item.id}:${key}`, props.send(say(item)) === true ? 'sent' : 'failed') }, label))),
			)
		}

		/** 图上实体旁的条目计数(只列非零的格)。 */
		function CountMarks(props) {
			const counts = props.counts ?? {}
			const shown = COUNT_ORDER.filter((key) => (counts[key] ?? 0) > 0)
			if (shown.length === 0) return null
			return h('span', { className: 'clearai-kcount', title: shown.map((key) => `${COUNT_WORD[key]} ${counts[key]}`).join(' · ') }, ...shown.map((key) => h('em', { key, 'data-b': key }, String(counts[key]))))
		}

		/**
		 * **实体卡**:点实体图上的实例打开。六栏:已确立的事实 / 已排除 / 适用边界 / 测量与口径 / 未解释的现象 / 经验。
		 * 空栏不出现;全空就如实说还没有沉淀。
		 */
		function EntityCard(props) {
			const { node, data } = props
			const byKey = itemsByKey(data)
			const items = (data?.entityKnowledge?.[node.id]?.items ?? []).map((key) => byKey.get(key)).filter((item) => item !== undefined)
			const facts = items.filter((item) => item.kind === 'fact')
			const excluded = items.filter((item) => item.kind === 'negative' && (item.status === 'excluded' || item.status === 'preliminary_excluded'))
			const bounds = facts.flatMap((item) => item.boundaries.map((bound, index) => ({ key: `${item.id}#${index}`, text: item.text, bound })))
			const defects = items.filter((item) => item.kind === 'negative' && item.status === 'defect')
			const measures = (Array.isArray(data?.lexicon?.predicates) ? data.lexicon.predicates : []).filter((predicate) => predicate.kind === 'measures' && node.type !== null && (predicate.domain === node.type || predicate.range?.term === node.type))
			const unresolved = items.filter((item) => item.kind === 'negative' && (item.status === 'unresolved' || item.status === 'escalated'))
			const lessons = items.filter((item) => item.kind === 'lesson')
			const row = (item) => h(KnowledgeItemRow, { key: `${item.kind}:${item.id}`, item, asks: item.kind !== 'lesson', send: props.send, sent: props.sent, onSent: props.onSent, openPreview: data?.openPreview })
			const section = (title, children, count = children.length) => (children.length === 0 ? null : h('div', { className: 'clearai-ecard-sec' }, h('div', { className: 'clearai-ecard-head' }, `${title}(${count})`), ...children))
			const sections = [
				section(t('已确立的事实'), facts.map(row)),
				section(t('已排除'), [
					...excluded.filter((item) => item.status === 'excluded').map(row),
					...(excluded.some((item) => item.status === 'preliminary_excluded')
						? [h('details', { key: 'preliminary', className: 'clearai-ecard-fold' }, h('summary', null, `${t('初步排除(')}${excluded.filter((item) => item.status === 'preliminary_excluded').length}${t(')')}`), ...excluded.filter((item) => item.status === 'preliminary_excluded').map(row))]
						: []),
				], excluded.length),
				section(
					t('适用边界'),
					bounds.map(({ key, text, bound }) => h('div', { key, className: 'clearai-kitem' }, h('div', { className: 'clearai-kitem-head' }, h(StateTag, { state: 'bounded' }, VERDICT_WORD[bound.verdict] ?? bound.verdict), h('span', null, text)), bound.basis ? h('div', { className: 'clearai-kitem-meta' }, brief(bound.basis, 120)) : null)),
				),
				section(t('测量与口径'), [
					...measures.map((predicate) => h('div', { key: `m-${predicate.id}`, className: 'clearai-kitem' }, h('div', { className: 'clearai-kitem-head' }, h('span', null, String(predicate.label ?? predicate.id))), predicate.check ? h('div', { className: 'clearai-kitem-meta' }, `${t('校准关系')}${t(':')}${predicate.check}`) : null)),
					...defects.map(row),
				]),
				section(t('未解释的现象'), unresolved.map(row)),
				section(t('经验'), lessons.map(row)),
			].filter((item) => item !== null)
			return h(
				'div',
				{ className: 'clearai-ecard' },
				h('div', { className: 'clearai-ecard-title' }, String(node.label ?? node.ref ?? node.id), h(CountMarks, { counts: data?.entityKnowledge?.[node.id]?.counts })),
				sections.length === 0 ? h('div', { className: 'clearai-quiet' }, t('该实体暂无沉淀的知识。')) : null,
				...sections,
			)
		}

		/** 探索货架:引用的已有知识(系统判定)与将沉淀的内容。两节都空就不出现。 */
		function KnowledgeFlowBox(props) {
			const flow = props.data?.knowledgeFlow ?? null
			if (flow === null) return null
			const cited = Array.isArray(flow.cited) ? flow.cited : []
			const negatives = Array.isArray(flow.settling?.negatives) ? flow.settling.negatives : []
			const awaiting = Array.isArray(flow.settling?.awaiting) ? flow.settling.awaiting : []
			return h(
				React.Fragment,
				null,
				cited.length === 0
					? null
					: h(
							'section',
							{ className: 'clearai-box' },
							h('div', { className: 'clearai-box-head' }, h('span', { className: 'clearai-box-title' }, `${t('引用的已有知识(')}${cited.length}${t(')')}`)),
							...cited.map((item) =>
								h(
									'div',
									{ key: `${item.id}|${item.verdict}`, className: 'clearai-kitem' },
									h('div', { className: 'clearai-kitem-head' }, h(StateTag, { state: item.verdict }, VERDICT_WORD[item.verdict] ?? item.verdict), h('span', null, item.text ?? item.id), item.path ? h('span', { className: 'clearai-link', onClick: () => props.openPreview?.(item.path), title: item.path }, t('查看记录')) : null),
									h('div', { className: 'clearai-kitem-meta' }, [`${t('引用者:')}${item.by.join(t('、'))}`, VERDICT_NEXT[item.verdict] ?? null].filter((line) => line !== null).join(' · ')),
								),
							),
						),
				negatives.length === 0 && awaiting.length === 0
					? null
					: h(
							'section',
							{ className: 'clearai-box' },
							h('div', { className: 'clearai-box-head' }, h('span', { className: 'clearai-box-title' }, t('将沉淀的内容')), h('span', { className: 'clearai-box-note' }, t('已写入的排除与未解释项;结案时待独立核验的结论'))),
							...negatives.map((item) => h(KnowledgeItemRow, { key: item.id, item, openPreview: props.openPreview })),
							...awaiting.map((item) => h('div', { key: item.id, className: 'clearai-kitem' }, h('div', { className: 'clearai-kitem-head' }, h(StateTag, { state: 'examining' }, t('待独立核验')), h('span', null, item.name), item.claim !== item.name ? h('span', { className: 'clearai-kitem-meta' }, brief(item.claim, 80)) : null))),
						),
			)
		}

		/** 结论卡底部:本目标已沉淀的条数。 */
		function SettledLine(props) {
			const settled = props.data?.knowledgeFlow?.settled ?? null
			if (settled === null) return null
			const parts = [
				settled.established > 0 ? `${t('已确立 ')}${settled.established}${t(' 条')}` : null,
				settled.excluded > 0 ? `${t('已排除 ')}${settled.excluded}${t(' 条')}` : null,
				settled.unresolved > 0 ? `${t('未解释 ')}${settled.unresolved}${t(' 项')}` : null,
				(settled.defects ?? 0) > 0 ? `${t('测量或方法缺陷 ')}${settled.defects}${t(' 项')}` : null,
				settled.lessons > 0 ? `${t('经验 ')}${settled.lessons}${t(' 条')}` : null,
			].filter((item) => item !== null)
			if (parts.length === 0) return null
			return h('div', { className: 'clearai-settled' }, h('span', { className: 'clearai-answer-label' }, t('本次沉淀')), h('span', null, parts.join(' · ')))
		}

		/** 本体货架的结论卡:按问题切换,四部分(结论 / 依据 / 尚未确定的事项 / 待您决策)。 */
		function AnswerCards(props) {
			const answers = Array.isArray(props.data?.goal?.answers) ? props.data.goal.answers : []
			const [picked, setPicked] = React.useState(null)
			if (answers.length === 0) return null
			const questions = Array.isArray(props.data?.exploration?.questions) ? props.data.exploration.questions : []
			const textOf = (id) => questions.find((question) => question.id === id && !question.implicit)?.text ?? null
			const chosen = answers.find((answer) => answer.question === picked) ?? answers[0]
			const part = (label, body, warm = false) => h('div', { className: 'clearai-answer-part', 'data-warm': warm ? '1' : '0' }, h('span', { className: 'clearai-answer-label' }, label), body)
			const open = Array.isArray(chosen.open) ? chosen.open : []
			const decide = Array.isArray(chosen.decide) ? chosen.decide : []
			const basis = Array.isArray(chosen.basis) ? chosen.basis : []
			return h(
				'div',
				{ className: 'clearai-answers' },
				answers.length < 2
					? null
					: h(
							'div',
							{ className: 'clearai-pills' },
							...answers.map((answer, index) =>
								h(
									'button',
									{ key: `q-${index}`, type: 'button', className: 'clearai-qtab', 'aria-pressed': answer === chosen ? 'true' : 'false', onClick: () => setPicked(answer.question) },
									`${t('问题 ')}${index + 1}${textOf(answer.question) ? ` · ${brief(textOf(answer.question), 16)}` : ''}`,
								),
							),
						),
				h(
					'section',
					{ className: 'clearai-answer' },
					part(t('结论'), h('span', { className: 'clearai-answer-main' }, chosen.conclusion || `${t('未能回答:')}${chosen.unanswered ?? ''}`)),
					basis.length === 0 ? null : part(t('依据'), h('div', { className: 'clearai-answer-lines' }, ...basis.map((line, index) => h('div', { key: `b-${index}` }, h('span', null, line), ' ', h('span', { className: 'clearai-link', onClick: () => props.openExplore?.() }, t('查看探索记录')))))),
					open.length === 0 ? null : part(t('尚未确定的事项'), h('div', { className: 'clearai-answer-lines' }, ...open.map((entry, index) => h('div', { key: `o-${index}` }, entry.effect)))),
					decide.length === 0 ? null : part(t('待您决策'), h('div', { className: 'clearai-answer-lines' }, ...decide.map((line, index) => h('div', { key: `d-${index}` }, line))), true),
				),
				h(SettledLine, { data: props.data }),
			)
		}

		/** 经验:以前结案时核过的「下次怎么做」(含别的会话留下的)。 */
		function LessonList(props) {
			const lessons = Array.isArray(props.data?.lessons) ? props.data.lessons : []
			if (lessons.length === 0) return null
			return h(
				'div',
				{ className: 'clearai-list' },
				...lessons.map((lesson) =>
					h('div', { key: lesson.id, className: 'clearai-lesson' }, h('span', { className: 'clearai-lesson-kind' }, LESSON_WORD[lesson.kind] ?? lesson.kind), h('span', null, lesson.text), lesson.boundary ? h('span', { className: 'clearai-lesson-meta' }, `${t('不适用:')}${lesson.boundary}`) : null),
				),
			)
		}

		/** 逐段编码:照抄原生的 `encodeSegment`——`:` 保持字面(Windows 盘符),其余交给 encodeURIComponent。 */
		const encodeAddressSegment = (segment) => encodeURIComponent(segment).replace(/%3A/gi, ':')
		const fileAddress = (sessionId, path) => {
			// 归一化也照抄原生(`sessionFileAddress`):反斜杠→`/`,去掉开头的 `./`。
			const normalized = String(path).replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
			const segments = normalized.split('/').map(encodeAddressSegment)
			return `dsh-resource://file/session/${encodeAddressSegment(sessionId)}/${segments.join('/')}`
		}
		const openNativePreview = (sidebarRight, sessionId, path) => {
			if (typeof sessionId !== 'string' || sessionId === '' || typeof path !== 'string' || path === '') return false
			const address = fileAddress(sessionId, path)
			try {
				// 原生那两个入口:当前会话用 `openResource`,指定会话用 `openResourceIn`
				// (原生 chat 与 files 都是前者)。
				if (sidebarRight !== undefined && typeof sidebarRight.openResource === 'function') {
					sidebarRight.openResource(address)
					return true
				}
				if (sidebarRight !== undefined && typeof sidebarRight.openResourceIn === 'function') {
					sidebarRight.openResourceIn(sessionId, address)
					return true
				}
			} catch {
				return false
			}
			return false
		}

		/**
		 * 世界树(右栏):计划的步骤与闸门,一条脊柱从上往下。
		 *
		 * 几何照抄 ClearAI `PlanTree.tsx`(`ROW_H=30 / NODE_R=6`):行高固定 → 拓扑常驻不变。
		 * 四条正交通道各答一个问题、可任意叠加:
		 *
		 *   ① **填充**  已落定终局了吗      实心 = 是(于是「实心到哪儿就是做到哪儿」,进度成了一眼可读的形)
		 *   ② **颜色**  什么结局            绿=过 灰=待办/作废 蓝=在跑 琥珀=等你
		 *   ③ **光环**  此刻在动吗          虚线环 = 独立评估者正在审这一步
		 *   ④ **分段**  被闸门裁断过几次    N>1 才分段,封顶 3 段,驳回的那几段画红
		 *
		 * 第一性原理:一棵树好不好读,取决于**每一条通道只答一个问题**。
		 * 并行探索不在这里画车道:竞争路线是竞争的假设,各由一个步骤检验,所以它们就是脊柱上的几步。
		 */
		const TREE = {
			rowHeight: 30,
			laneWidth: 15,
			padX: 10,
			radius: 6,
			arcWidth: 1.5,
			arcGap: 2,
			maxArcs: 3,
			halo: 9,
		}
		const TREE_COLOR = {
			done: 'rgb(var(--dsw-color-success, 16 185 129))',
			running: '#7dd3fc',
			pending: '#cbd5e1',
			pruned: '#cbd5e1',
			rail: 'hsla(220, 9%, 46%, 0.35)',
		}
		/** 一步**被闸门裁断过几次**(`block/counted` 折出来的驳回次数 + 通过的那一次)。 */
		function treeLoops(blocks, planId, stepId, advanced) {
			const counted = Number(blocks?.[planId]?.[stepId] ?? 0)
			const fails = Number.isFinite(counted) && counted > 0 ? counted : 0
			return { fails, rounds: fails + (advanced ? 1 : 0) }
		}

		/**
		 * **对外聚焦通道**:别的面点一个步骤,世界树要能**选中那一行**。
		 *
		 *   · 一个**纯函数** `rowIndexOf(rows, target)`:行身份 = `step.id`,返回行下标或 null(可单测 ✓);
		 *   · 一个**订阅式小 store**:聚焦是**界面状态**,不是事实 —— 不写任何变更、不进账本 ✓。
		 */
		function rowIndexOf(rows, target) {
			if (target === null || target === undefined || typeof target.step !== 'string' || target.step === '') return null
			const index = rows.findIndex((row) => row?.step?.id === target.step)
			return index === -1 ? null : index
		}

		/**
		 * 聚焦通道的**统一形状**:一个值 + 一组订阅者。
		 * 它是**界面状态**(点了哪一行),不是事实 —— 不写变更、不进账本。
		 */
		function makeFocusStore() {
			const store = {
				value: null,
				listeners: new Set(),
				set(target) {
					store.value = target
					for (const listener of store.listeners) listener(target)
				},
				subscribe(listener) {
					store.listeners.add(listener)
					return () => store.listeners.delete(listener)
				},
			}
			return store
		}

		/** 聚焦变了就重渲染的读法(两个面各一份)。 */
		function useFocus(store) {
			const [value, setValue] = React.useState(store.value)
			React.useEffect(() => store.subscribe(setValue), [])
			return value
		}

		const treeFocus = makeFocusStore()
		/**
		 * **反向聚焦**:从世界树的某一步跳回「事实」那一格,并**展开对应的命题**。
		 * 与 treeFocus 同一个形状、同一条纪律(界面状态,不进账本)。
		 */
		const factsFocus = makeFocusStore()

		/**
		 * 哪条命题的证据来自这一步(纯函数:可单测)。
		 *
		 * 唯一的关系就是**步骤上登记的 `tests.hypotheses`**(检验几条就取第一条展开)—— 不猜:这一步没登记命题
		 * (自判的 L0 步骤常常没有)就返回 `null`,界面因此**不乱展开**任何一条命题 ✓。
		 * (第一版这里写过一个"退一步看证据挂谁"的回退,而它又去查同一个索引 ⇒ 循环 ✗,已删。)
		 */
		function propositionForStep(data, stepId) {
			if (typeof stepId !== 'string' || stepId === '') return null
			const hypothesis = testedOf((data?.stepIndex ?? {})[stepId])[0]
			return typeof hypothesis === 'string' && hypothesis !== '' ? hypothesis : null
		}

		/** 计划摊成行:一步一行,全在脊柱上。纯函数,便于断言拓扑。 */
		function treeRows(plan) {
			return (plan?.steps ?? []).map((step) => ({ kind: 'step', lane: 0, step }))
		}

		/** 行与行之间的连接:相邻两步连一段脊柱。 */
		function treeConns(rows) {
			return rows.slice(1).map((_, index) => ({ from: index, fromLane: 0, to: index + 1, toLane: 0 }))
		}

		/** 轨道在节点**边缘**收住,不进节点内部(照抄原型)。 */
		const railClear = () => TREE.radius + 1.5

		/**
		 * 一条连接画成什么路径:同车道 = 直线;跨车道 = 三次贝塞尔(控制点与端点同 x,
		 * 所以两端仍是竖直的,与节点的净空对得上)。
		 */
		function railPath(conn, rows) {
			const x1 = TREE.padX + conn.fromLane * TREE.laneWidth
			const x2 = TREE.padX + conn.toLane * TREE.laneWidth
			const y1 = conn.from * TREE.rowHeight + TREE.rowHeight / 2 + 4 + railClear(rows[conn.from])
			const y2 = conn.to * TREE.rowHeight + TREE.rowHeight / 2 + 4 - railClear(rows[conn.to])
			if (y2 <= y1) return '' // 两行挨太近,净空吃掉了整段:不画残线
			if (x1 === x2) return `M${x1} ${y1} L${x2} ${y2}`
			const my = (y1 + y2) / 2
			return `M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
		}

		/**
		 * 四条通道的**唯一来源**:给一行,算出它该怎么画。
		 *
		 * 为什么收成一个纯函数:原设计的教训(它自己的注释里写着)——分段节点曾经走独立的
		 * early-return 分支,于是那个分支悄悄漏掉了活性光环,「一个正在跑的步骤只要磨过轮次
		 * 就再也不显示它在动」。通道一多,漏项就难发现;所以**一条代码路径**算完再叠加。
		 */
		function treeMarks(row, context) {
			const blocks = context?.blocks ?? null
			const audits = context?.audits ?? []
			const planId = context?.planId ?? null
			const stepId = row.step?.id ?? null
			const advanced = row.step?.status === 'advanced'
			const loops = treeLoops(blocks, planId, stepId, advanced)
			// ① 填充:落定终局了吗(advanced | void)
			const settled = row.step.status === 'advanced' || row.step.status === 'void'
			// ③ 光环:有 Evaluator 正在审这一步(audits 里 verdict 还没回来)
			const auditing = audits.some((audit) => audit.stepId === stepId && (audit.verdict === null || audit.verdict === undefined))
			// ② 颜色:什么结局
			const color = row.step.status === 'advanced' ? TREE_COLOR.done : row.step.status === 'void' ? TREE_COLOR.pruned : TREE_COLOR.pending
			// 变灰划掉:作废的步(单增:留档不删)
			const greyed = row.step.status === 'void'
			const done = row.step.status === 'advanced'
			return { settled, color, live: false, auditing, greyed, done, loops, ...loops }
		}

		/**
		 * 圆环上第 `i`/`total` 段弧的 dash 参数(照抄原设计):用 dasharray 而不是手写
		 * `<path d="M… A…">`——同一个圆复制 N 份、各自偏移一格,每份只显出一段,
		 * 于是每段可独立着色,而且**不必算三角函数**。
		 */
		function arcDash(index, total, r = TREE.radius) {
			const circumference = 2 * Math.PI * r
			const slot = circumference / Math.max(1, total)
			const gap = total <= 1 ? 0 : Math.min(TREE.arcGap, slot * 0.5)
			return { strokeDasharray: `${slot - gap} ${circumference - slot + gap}`, strokeDashoffset: -(index * slot) }
		}
		/** 要画的弧:只取闸门轮次,封顶 3 段(超出的轮数由行右的 「N 轮」承载)。 */
		function treeArcs(marks) {
			// 无事发生(一次就过)= 不画弧:节点保持一个干净的圆点。
			if (marks.fails === 0 && marks.rounds <= 1) return []
			const shown = Math.min(TREE.maxArcs, marks.rounds)
			/**
			 * 弧要画**最近**的几轮(越靠近现在越有解释力),而驳回总是发生在前几轮——
			 * 所以「这一弧是不是驳回」要按**绝对轮次**算:`start + index < fails`。
			 * 按相对位置算会把「驳回 3 次后终于过了」画成三个红弧,而那一步其实已经通过了。
			 */
			const start = marks.rounds - shown
			return Array.from({ length: shown }, (_, index) => ({ key: `arc-${index}`, index, fail: start + index < marks.fails }))
		}
		/** 世界树页签。选中一行 → 树下详情(结构在上、细节在下,树本身不动)。 */
		function WorldTree(props) {
			const sessions = props.useSessions
			const sessionId = props.sessionId
			/** 探索货架里直接把投影交下来(`data`);旧的独立挂法仍按会话快照取。 */
			const data =
				props.data !== undefined
					? props.data
					: typeof sessions === 'function' && typeof sessionId === 'string'
						? sessions((snapshot) => snapshot?.byId?.[sessionId]?.projectionValues?.clearai)
						: undefined
			const [manual, setManual] = React.useState(null)
			const [picked, setPicked] = React.useState(null)
			const focus = useFocus(treeFocus)
			/**
			 * **一个对话会有多个世界树**:活动的那份默认显示,已收尾的可以切回去看
			 * (它们没被删:文档归档在 `clear/goals/plans/<id>.md`)。
			 * 优先级:外面点进来的聚焦所指的那份 > 手动切的 > 活动的。
			 */
			const plans = data === null || data === undefined || !Array.isArray(data.plans) ? [] : data.plans
			const wanted = (focus !== null && focus !== undefined && typeof focus.plan === 'string' ? focus.plan : null) ?? picked
			const chosen = wanted === null ? null : plans.find((item) => item.id === wanted) ?? null
			const plan = chosen ?? (data === null || data === undefined ? null : data.plan)
			if (plan === null || plan === undefined) {
				return h('div', { style: S.wrap }, h('div', { style: S.bar }, h('span', { style: S.title }, t('计划'))), h(Empty, null, t('暂无计划。建立计划后,此处将显示计划的步骤与闸门。')))
			}
			const rows = treeRows(plan)
			/** 页眉那一句:计划的首个非空行,过长再截(整篇在 tooltip 与「计划文档」里)。 */
			const briefLine = String(plan.brief ?? '').split('\n').map((line) => line.trim()).find((line) => line !== '' && !line.startsWith('#')) ?? ''
			const briefText = String(plan.brief ?? '').trim()
			/** 计划编号(p-…)不上屏:人认的是那一句思路。 */
			const titleText = briefLine === '' ? '' : brief(briefLine, 44)
			/** 外面点进来的聚焦优先;手动点行仍然有效(聚焦为 null 时用它)。 */
			const focused = rowIndexOf(rows, focus)
			const selected = focused === null ? manual : focused
			const context = { blocks: data.blocks ?? null, audits: data.audits ?? [], planId: plan.id }
			const gutter = TREE.padX * 2 + TREE.laneWidth
			const x = (lane) => TREE.padX + lane * TREE.laneWidth
			const y = (index) => index * TREE.rowHeight + TREE.rowHeight / 2 + 4
			const marksOf = rows.map((row) => treeMarks(row, context))
			// 轨道:相邻两步连一段脊柱;通向作废步的那段画灰。
			const svg = treeConns(rows).map((conn, index) => {
				const dashed = marksOf[conn.to].greyed
				return h('path', { key: `rail-${index}`, d: railPath(conn, rows), fill: 'none', stroke: dashed ? TREE_COLOR.pruned : TREE_COLOR.rail, strokeWidth: 1 })
			})
			rows.forEach((row, index) => {
				const marks = marksOf[index]
				const cx = x(row.lane)
				const cy = y(index)
				const arcs = treeArcs(marks)
				const nodes = []
				// ③ 光环(先画,在节点下面)
				if (marks.auditing) {
					nodes.push(h('circle', { key: 'halo', cx, cy, r: TREE.halo, fill: 'none', stroke: TREE_COLOR.running, strokeWidth: 1.4, strokeDasharray: '2 2.5', className: 'clearai-breathe-stroke' }))
				}
				{
					// ① 填充:落定的画实心核(有分段时核再小一圈,不与弧粘连)
					if (marks.settled) {
						nodes.push(h('circle', { key: 'core', cx, cy, r: arcs.length > 0 ? TREE.radius - TREE.arcWidth - 1 : TREE.radius, fill: marks.color }))
					}
					// ④ 分段:每段一次闸门裁断,驳回的画红
					if (arcs.length > 0) {
						for (const arc of arcs) {
							nodes.push(
								h('circle', {
									key: arc.key,
									cx,
									cy,
									r: TREE.radius,
									fill: 'none',
									stroke: arc.fail ? '#c98f8f' : marks.color,
									strokeWidth: TREE.arcWidth,
									transform: `rotate(-90 ${cx} ${cy})`,
									...arcDash(arc.index, arcs.length),
								}),
							)
						}
					} else if (!marks.settled) {
						// 还没落定又没故事:一个干净的空心圈(实心到哪儿就是做到哪儿)
						nodes.push(h('circle', { key: 'node', cx, cy, r: TREE.radius, fill: 'transparent', stroke: marks.color, strokeWidth: 1.4 }))
					}
				}
				svg.push(h('g', { key: `node-${index}` }, nodes))
			})
			const counts = (row) => {
				const marks = treeMarks(row, context)
				const judges = (data.audits ?? []).filter((item) => item.stepId === row.step.id).length
				return { marks, judges }
			}
			/** 行里只放**认得出这一步的那几个字**:`do` 常常是整句话,全文在点开的详情里。 */
			const rowLabel = (row) => `${row.step.ordinal}. ${brief(row.step.do, 26)}`
			return h(
				'div',
				{ style: S.wrap },
				h(
					'div',
					{ style: S.bar },
					h('span', { style: S.title }, t('计划')),
					/**
					 * 页眉只放**一句话**:`brief` 常常是整篇 markdown 计划(真数据里这一行渲染出 1794 字 ✗),
					 * 全文进 tooltip,要读整篇点「打开计划」(原生预览 `clear/goals/plans/<id>.md`)——
					 * 默认少而准,细节靠点开。
					 */
					h('span', { style: S.faint, title: briefText }, titleText),
					/**
					 * **历史世界树的入口**:一个对话会有多个计划。
					 * 只有一份时不出现 ✓;多份时用**一个原生下拉**(一行,不铺一排标签 —— 真数据里有 8 份 ✗)。
					 * 默认停在最近那份;切到旧的会在下面标出「已收尾 · 存档可看」。
					 */
					plans.length <= 1
						? null
						: h(
								'select',
								{
									value: plan?.id ?? '',
									onChange: (event) => {
										setPicked(event.target.value)
										setManual(null)
									},
									title: t('切换到以前的计划(计划均保留,文档归档在 clear/goals/plans/)'),
									style: { font: 'inherit', fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', background: 'transparent', border: '.5px solid var(--dsw-alias-border-l2)', borderRadius: 6, padding: '1px 4px' },
								},
								...plans.map((item, index) =>
									h('option', { key: item.id, value: item.id }, `${t('计划 ')}${index + 1}/${plans.length} · ${item.status === 'active' ? '推进中' : '已收尾'}`),
								),
							),
					chosen === null
						? null
						: h('span', { style: { ...S.faint, opacity: 0.8 } }, t('已完成 · 可查看存档')),
					h(
						'span',
						{ style: S.faint },
						`${t('步 ')}${rows.length}`,
					),
					props.openPreview === undefined
						? null
						: h(Link, { onClick: () => props.openPreview(`clear/goals/plans/${plan.id}.md`), title: t('打开计划文档(原生预览)') }, t('计划文档')),
					h('span', { style: { ...S.faint, marginLeft: 'auto' } }, t('点击查看详情')),
				),
				/**
				 * 这一格是**计划的一切**:目标是脊柱的起点、步骤是它的形状、
				 * 要你拍板的那一下(人门)就发生在某一步上——所以三样都在这张图上,
				 * 而不是散在三个页签里(「进展」那一格因此撤了)。
				 */
				h(GoalLine, { goal: data.goal, view: data.knowledgeView, openPreview: props.openPreview }),
				h(NeedYou, { data }),
				h(
					'div',
					{ style: { display: 'flex', gap: 8, alignItems: 'flex-start' } },
					h('svg', { width: gutter, height: rows.length * TREE.rowHeight + 8, style: { flex: '0 0 auto' } }, svg),
					h(
						'div',
						{ style: { flex: 1, minWidth: 0 } },
						rows.map((row, index) => {
							const marks = marksOf[index]
							const stat = counts(row)
							const isSel = selected === index
							return h(
								'div',
								{
									key: `t-${index}`,
									className: 'clearai-treerow',
									'data-sel': isSel ? '1' : '0',
									style: { height: TREE.rowHeight, overflow: 'hidden' },
									onClick: () => {
										// 手动点行:先清掉外面的聚焦(否则它一直压着手动选择,点了没反应 ✗)
										treeFocus.set(null)
										setManual(isSel ? null : index)
									},
									title: t('查看步骤详情'),
								},
								h(
									'span',
									{
										style: {
											flex: 1,
											minWidth: 0,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontWeight: 400,
											...(marks.greyed
												? { color: 'var(--dsw-alias-label-secondary)', opacity: 0.55, textDecoration: 'line-through' }
												: marks.done
													? { color: 'var(--dsw-alias-label-secondary)' }
													: {}),
										},
									},
									rowLabel(row),
								),
								stat === null ? null : h(
									'span',
									{ style: { flex: '0 0 auto', display: 'flex', gap: 6, ...S.faint, marginLeft: 'auto' } },
									/** 说人话:只有返工过才说「做了 N 轮」;起过独立核验就写「独立核验」。 */
									stat.marks.loops.rounds > 1
										? h('span', { title: `${stat.marks.loops.rounds}${t(' 轮')}${stat.marks.loops.fails > 0 ? ` · 其中 ${stat.marks.loops.fails} 次被驳回` : ''}` }, `${stat.marks.loops.rounds}${t(' 轮')}`)
										: null,
									stat.judges > 0 ? h('span', { title: `${t('已派出评估者 ')}${stat.judges}${t(' 次')}` }, t('独立核验')) : null,
								),
							)
						}),
					),
				),
				selected === null ? null : h(TreeDetail, { row: rows[selected], data, openPreview: props.openPreview, openSpectator: props.openSpectator, openFacts: props.openFacts, onClose: () => setManual(null) }),
			)
		}

		/** 树下的详情:选中那一步的**事实**都在这里(树上只有形状,文字细节在这里)。 */
		function TreeDetail(props) {
			const row = props.row
			const data = props.data ?? {}
			const step = row.step
			const evidence = (data.evidence ?? []).filter((item) => item.stepId === step?.id)
			const audits = (data.audits ?? []).filter((item) => item.stepId === step?.id)
			return h(
				'div',
				{ style: { marginTop: 10, borderTop: '.5px solid var(--dsw-alias-border-l1)', paddingTop: 8 } },
				h(
					'div',
					{ style: S.inline },
					h('span', { style: S.head, title: step.id }, `${nth(step.ordinal)}`),
					h(Link, { onClick: () => props.onClose?.(), title: t('收起详情') }, h('span', { style: S.faint }, t('收起'))),
				),
				step === null || step === undefined
					? null
					: h(
							'div',
							{ style: S.kv },
							h('span', { style: S.faint }, t('任务内容')), h('span', null, step.do),
							h('span', { style: S.faint }, t('判据')), h('span', null, `${step.doneCriteria}${step.voidReason === null || step.voidReason === undefined ? '' : `(作废:${step.voidReason})`}`),
							h('span', { style: S.faint }, t('状态')), h('span', null, `${gloss(STEP, step.status)}${step.level === null || step.level === undefined ? '' : ` · ${step.level}`}`),
							h(
								'span',
								{ style: S.faint },
								t('产物'),
							),
							h(
								'span',
								null,
								...(step.artifacts ?? []).length === 0
									? [t('未声明')]
									: (step.artifacts ?? []).map((artifact, index) => {
											/**
											 * 两种形状都吃:声明里是**字符串**,宿主路由 stat 过的是**对象**。
											 * 而且 `exists` 有三态:true / false(查过、不在) / null(**没查过**)——
											 * 「没查过」不许说成「缺」(真数据里树详情因此把每个产物都写成 `undefined(缺)` ✗)。
											 */
											const path = typeof artifact === 'string' ? artifact : artifact?.path
											const exists = typeof artifact === 'string' ? null : (artifact?.exists ?? null)
											if (typeof path !== 'string' || path === '') return null
											return h(
												'span',
												{ key: `${path}-${index}`, style: { marginRight: 8 } },
												exists === false
													? h('span', { style: { ...S.mono, opacity: 0.6 }, title: t('磁盘上未找到该文件') }, `${path}${t('(缺失)')}`)
													: h(Link, { onClick: () => props.openPreview?.(path), title: exists === true ? t('在原生预览中打开') : t('在原生预览中打开(计划声明的产物)') }, h('span', { style: S.mono }, path)),
											)
										}),
							),
							/**
							 * **反向跳**:从树里的这一步跳到「事实」那一格,并展开对应的命题。
							 * 切中栏视图走**原生正门** selectPanel(经可选读法拿到的 layout 服务;守卫:
							 * 没注册的 key 它会抛,而抛了不该把整棵树带下水)。
							 */
							props.openFacts === undefined
								? null
								: h('span', { style: S.faint }, t('证据')),
							props.openFacts === undefined
								? null
								: h(
										'span',
										null,
										h(
											Link,
											{
												onClick: () => props.openFacts(step.id),
												title: t('在本体货架中展开此结论'),
											},
											t('查看此步骤的证据'),
										),
									),
						),
				evidence.length === 0 && audits.length === 0
					? null
					: h(
							'div',
							{ style: { marginTop: 6 } },
							evidence.map((item) => h('div', { key: item.id, style: S.faint }, `${t('检验结果:')}${VERDICT[item.verdict] ?? '—'} · ${howOf(item)}${item.basis ? ` · ${brief(item.basis, 60)}` : ''}`)),
							audits.map((item) =>
								h(
									'div',
									{ key: item.id, style: S.faint },
									`${t('独立核验:')}${item.verdict === null || item.verdict === undefined ? t('正在裁决') : (VERDICT[item.verdict] ?? item.verdict)}`,
									item.evaluatorSession === null || item.evaluatorSession === undefined ? null : h(Link, { onClick: () => props.openSpectator?.(item.evaluatorSession) }, h('span', null, t(' 查看核验过程'))),
									item.cardPath === null || item.cardPath === undefined ? null : h(Link, { onClick: () => props.openPreview?.(item.cardPath) }, h('span', null, t(' 查看核验记录'))),
								),
							),
						),
			)
		}

		/** 待处理:只陈述的几行(计划停下、结论矛盾),没有按钮——要怎么办,在对话里说。 */
		function NeedYou(props) {
			const items = Array.isArray(props.data?.needYou) ? props.data.needYou : []
			if (items.length === 0) return null
			return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, margin: '0 0 8px' } }, ...items.map((item, index) => h('div', { key: `need-${index}`, className: 'clearai-need' }, h('b', null, t('待处理')), String(item?.text ?? ''))))
		}

		/**
		 * 旁观入口(阶段 4 的 4.5):点一下跳到那个子会话,**只看不动手**。
		 * 判断不许匿名——评估者/仲裁是谁、在哪,面板上给得出入口。
		 * 拿不到会话服务就退化成一行文本 id:宁可少一个按钮,也不假装能跳。
		 */

		/**
		 * 计划的小图形:一棵**迷你世界树**——一根脊柱、一条岔、两个节点。
		 * 用 `currentColor`:颜色留给状态(等人确认 = 琥珀,受阻 = 琥珀,收尾 = 灰),形状留给语义。
		 * 为什么要有它:工具行是要抢地盘的地方(两个字面项能占掉整行近三成,
		 * 窄窗口下会把发送键挤到第二行)。图标能省一半宽度,而它指向的正是「世界树」那一页。
		 */

		/**
		 * 一步的**人话**名字:`do` 是模型写的那句「做什么」,截短了放进一行。
		 * 内部步 id(`s-3`)只进 tooltip 与世界树——它在日志里是账,在界面上不是给人看的。
		 */
		function shortDo(text) {
			const value = String(text ?? '').trim()
			return value.length <= 12 ? value : `${value.slice(0, 12)}…`
		}

		/**
		 * 输入框下那条派生状态条**删掉了**。
		 *
		 * 它说的事(阶段 / 完成度 / 当前步)与**原生目标提示**、与工具行那颗计划 chip 的 `N/M`
		 * 说的是同一件 ✗ —— 而它**独占一行,把输入框整个顶上去** ✗。
		 * 唯一可点、且只有我们知道的那一件(「待处理 N」)已经并进计划 chip:
		 * 同一行、一点直达世界树。剩下的「为什么停」也在那颗 chip 上只说一句。
		 */
		/**
		 * 席位跟着会话预设进出。
		 *
		 * 为什么必须这样:`conversation.view` 是**产品级**插座,它的主人遍历全部注册项投影出
		 * 视图导航,不按会话过滤(宿主原生那个视图页签组件的 viewTabs() 只读 id 与 label)。
		 * 所以一个宿主平面的插件一旦注册,每个会话、每种模式都会多出一个页。
		 * 这个面板是循证模式的一部分,它只在那个模式里该出现——于是注册与注销都跟着
		 * 当前会话的 `projectionValues.agentPreset` 走。
		 */
		/** 包一层**只做一次**:现造会让 React 每次渲染都当成新组件,把面板整个重挂。 */

		/**
		 * **过滤的判据**(纯函数,导出给测试):一条事实/命题与一个词条是否相关。
		 *
		 * 匹配范围刻意放宽到「文本包含词条名/别名」:只按断言匹配更「纯」,但用户会觉得
		 * 「明明有条条目说到炉次,过滤出来没有」。断言命中优先,文本命中兜底——两种都算,
		 * 数字行(N/M)会把没匹配的说清楚,不会静默消失。
		 */
		const termMatches = (term, row) => {
			const id = String(term?.id ?? '')
			if (id === '') return false
			const labels = [term.label, ...(Array.isArray(term.aliases) ? term.aliases : [])].filter((item) => typeof item === 'string' && item !== '')
			const hitsText = [String(row?.text ?? ''), String(row?.claim ?? '')].some((text) => text.includes(id) || labels.some((label) => text.includes(label)))
			const hitsAssertion = (Array.isArray(row?.assertions) ? row.assertions : []).some((assertion) => {
				const subject = assertion?.subject ?? {}
				const object = assertion?.object ?? {}
				if (String(subject.type ?? '') === id || String(subject.id ?? '') === id || String(assertion?.predicate ?? '') === id) return true
				if (String(object.kind) === 'instance' && (String(object.type ?? '') === id || String(object.value ?? '') === id)) return true
				return false
			})
			return hitsAssertion || hitsText
		}

		/**
		 * **力导向布局**(graphology + ForceAtlas2),与参考实现 `refs/semantica/explorer` 同一套。
		 *
		 * 为什么不是分层布局:分层只认得「父子」这一种关系,而知识图谱里大量边是**非层级**的
		 * (谓词、断言)。真数据里 21 个概念只有 9 条 `is_a`,按层排就退化成一排——那不是图的形状,
		 * 是硬套的形状。力导向让**结构自己长出形状**:枢纽聚成中心、相关的东西聚成簇。
		 *
		 * **确定性**:起点用投影给的坐标(`graphProjection` 的按层折行排布)。
		 * FA2 从同一起点、同一参数出发必得同一结果,所以「同一份账本 ⇒ 同一张图」仍然成立;
		 * 而且首屏不用先看一团随机散点——它从一个读得懂的排布**松弛**到自然的形状。
		 *
		 * 拿不到它时退回投影坐标:图照样画得出来(同一条「降级要如实、不要崩」)。
		 */
		const Force = (() => {
			try {
				if (typeof __clearaiForce !== 'function') return null
				const loaded = __clearaiForce(require)
				return typeof loaded?.forceAtlas2?.assign === 'function' && typeof loaded?.Graph === 'function' ? loaded : null
			} catch (error) {
				try {
					console.warn('[clearai] 力导向布局加载失败:', error)
				} catch {
					/* console 不在也不该让面板挂掉 */
				}
				return null
			}
		})()
		/**
		 * 跑一次力导向。参数照参考实现(`FORCE_ATLAS_SETTINGS`);
		 * 迭代数按规模给,但有上限——大图上一次别把整帧卡住。
		 */
		const forceLayout = (nodes, edges) => {
			if (Force === null || nodes.length < 2) return nodes
			try {
				const graph = new Force.Graph({ multi: true, type: 'directed' })
				for (const node of nodes) graph.addNode(node.id, { x: node.position.x, y: node.position.y, size: 34 })
				for (const edge of edges) {
					if (edge.source === edge.target) continue
					if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue
					try {
						graph.addEdge(edge.source, edge.target)
					} catch {
						/* 平行边之类:真发生了也不该让整张图排不出来 */
					}
				}
				Force.forceAtlas2.assign(graph, {
					iterations: Math.min(300, Math.max(60, nodes.length * 3)),
					settings: {
						barnesHutOptimize: true,
						barnesHutTheta: 0.6,
						linLogMode: true,
						outboundAttractionDistribution: true,
						strongGravityMode: false,
						gravity: 0.14,
						scalingRatio: 4.8,
						slowDown: 6,
						edgeWeightInfluence: 1,
						adjustSizes: true,
					},
				})
				return nodes.map((node) => {
					const x = graph.getNodeAttribute(node.id, 'x')
					const y = graph.getNodeAttribute(node.id, 'y')
					return Number.isFinite(x) && Number.isFinite(y) ? { ...node, position: { x, y } } : node
				})
			} catch (error) {
				try {
					console.warn('[clearai] 力导向布局失败,退回投影坐标:', error)
				} catch {
					/* 同上 */
				}
				return nodes
			}
		}

		/**
		 * **节点小卡**:点图上的一个点或一条边,回答「这是什么、哪些结论用到它」。
		 *
		 * 数据仍然不在这里拼:组装住在宿主半的 `inspectGraphSelection`(经 `/api/clearai/inspector`),
		 * 这一层只请求与渲染。卡上只说人话:种类、释义、上下位、关系、用到它的结论;
		 * 编号、等级代码、证据 id 都不上屏(结论的来历在下面的结论列表里点开看)。
		 * 请求失败不清空旧内容——把上一次的结果换成一片空白,读的人会以为「这条知识没了」。
		 */
		const GraphInspector = ({ selection, sessionId, onFilter, onClose, inspector: injected, names }) => {
			const [state, setState] = React.useState({ loading: false, inspector: null, error: null })
			const key = selection === null ? '' : `${selection.kind}:${selection.id}`
			React.useEffect(() => {
				/** 宿主已经把读数喂进来时不再问一次(全屏工作区与测试都走这条缝)。 */
				if (injected !== undefined) return undefined
				if (key === '' || typeof sessionId !== 'string' || sessionId === '') return undefined
				let live = true
				setState((current) => ({ ...current, loading: true, error: null }))
				const url = `/api/clearai/inspector?sessionId=${encodeURIComponent(sessionId)}&kind=${encodeURIComponent(selection.kind)}&id=${encodeURIComponent(selection.id)}`
				fetch(url)
					.then((response) => response.json())
					.then((result) => {
						if (!live) return
						if (result?.ok !== true) setState({ loading: false, inspector: null, error: String(result?.error ?? 'failed') })
						else setState({ loading: false, inspector: result.found === true ? result.inspector : null, error: null })
					})
					.catch((thrown) => {
						if (live) setState({ loading: false, inspector: null, error: String(thrown?.message ?? thrown) })
					})
				return () => {
					live = false
				}
			}, [key, injected])
			if (selection === null) return null
			const data = injected === undefined ? state.inspector : injected
			const busy = injected === undefined && state.loading === true
			const failure = injected === undefined ? state.error : null
			const definition = data?.definition ?? {}
			const relations = data?.relations ?? {}
			const kv = (label, value) => (value === null || value === undefined || value === '' ? [] : [h('span', { key: `k-${label}` }, label), h('span', { key: `v-${label}` }, String(value))])
			const value = definition.value === undefined || definition.value === null ? null : `${String(definition.value)}${definition.unit ? ` ${String(definition.unit)}` : ''}`
			/** 用到它的结论:写进长期知识的那几条;被人撤回的标「已替换」,卷进矛盾的标「有矛盾」。 */
			const factTrust = (fact) => (fact.review?.decision === 'retracted' ? 'replaced' : (fact.conflicts ?? []).length > 0 ? 'conflict' : 'credible')
			const facts = Array.isArray(data?.facts) ? data.facts : []
			const title = String(selection.label ?? data?.selection?.label ?? selection.id)
			/** 关系串里的主语 / 宾语是实例 id(`i_jepa`):换成图上的名字(`I-JEPA`)再上屏。 */
			const named = (text) => [...(names ?? new Map()).entries()].sort((left, right) => right[0].length - left[0].length).reduce((out, [ref, label]) => out.split(ref).join(label), String(text ?? ''))
			return h(
				'div',
				{ className: 'clearai-card' },
				h(
					'div',
					{ className: 'clearai-card-head' },
					h('span', { className: 'clearai-card-kind' }, KIND_WORD[selection.kind] ?? t('关系')),
					h('span', { className: 'clearai-card-title' }, title),
					h('span', { style: { flex: '1 1 auto' } }),
					h('span', { className: 'clearai-link', onClick: onFilter }, t('仅显示相关项')),
					h('span', { className: 'clearai-link', onClick: onClose }, t('关闭')),
				),
				busy === true ? h('div', { className: 'clearai-quiet' }, t('正在加载…')) : null,
				failure !== null ? h('div', { className: 'clearai-quiet' }, `${t('无法获取')}${t(':')}${failure}`) : null,
				busy === false && failure === null && data === null ? h('div', { className: 'clearai-quiet' }, t('该项已不在当前词表中(可能已被废止)。')) : null,
				data === null
					? null
					: h(
							'div',
							{ className: 'clearai-kv' },
							...kv(t('释义'), definition.gloss),
							...kv(t('上位'), definition.parentLabel ?? definition.parent),
							...kv(t('下位'), (relations.children ?? []).map((item) => item.label).join('、')),
							...kv(t('主体'), definition.domainLabel ?? definition.domain),
							...kv(t('类型'), definition.typeLabel ?? definition.type),
							...kv(t('取值'), value),
							...kv(t('依据'), definition.basis),
							...kv(t('关系'), (relations.edges ?? []).slice(0, 6).map((edge) => named(edge.chip)).join('、')),
							...kv(t('实例'), (relations.instances ?? []).slice(0, 6).map((item) => item.label).join('、')),
							definition.status === 'deprecated' ? h('span', { key: 'dep', style: { gridColumn: '1 / -1' }, className: 'clearai-quiet' }, t('该术语已废止,既有结论中的用法仍可查看。')) : null,
						),
				facts.length === 0
					? null
					: h(
							'div',
							{ className: 'clearai-card-facts' },
							h('div', { className: 'clearai-group-head' }, t('引用此项的结论'), h('span', null, `${facts.length}${data.factsTruncated > 0 ? '+' : ''}`)),
							...facts.slice(0, 4).map((fact, index) =>
								h(
									'div',
									{ key: `f-${index}`, className: 'clearai-card-fact' },
									factTrust(fact) === 'conflict' ? h('span', { className: 'clearai-trust', 'data-trust': 'conflict' }, t('有矛盾')) : h(TrustTag, { trust: factTrust(fact) }),
									h('span', null, brief(fact.text, 60)),
									fact.scope && fact.scope !== fact.hypothesis?.refuteWhen ? h('span', { className: 'clearai-row-sub' }, `${t('范围:')}${brief(fact.scope, 40)}`) : null,
								),
							),
						),
			)
		}

		/**
		 * **星图(React Flow)**:本体图 / 实体图二选一。
		 *
		 * 渲染交给 @xyflow/react——拖节点、拖画布、滚轮缩放都是库的事。这一层只做三件 ClearAI 自己的事:
		 *   · **适配投影**:graphProjection() 的节点 / 边 → React Flow 的 nodes / edges;
		 *     视觉编码在这里(投影是语义不是样式):点 + 衬线标签;概念是空心圈、实例是实心点、
		 *     取值是小点;边实线 = 已验证(写进长期知识的断言),虚线 = 待核验(登记了、没过独立裁决),
		 *     淡线 = 上下位;卷进矛盾的点和边用告警色。
		 *   · **点击语义**:点节点 / 边 = 打开小卡;「只看相关」是卡上的显式动作。
		 *   · **全屏**:position: fixed 的真 overlay,打开时自动适配。
		 */
		/** 空投影:常量,免得每次渲染造一个新对象。 */
		const EMPTY_GRAPH = { nodes: [], edges: [], bounds: { width: 0, height: 0 } }

		/**
		 * 投影 → React Flow 的 nodes / edges(纯计算;GraphBand 用 useMemo 把它钉住)。
		 *
		 * 为什么必须稳定:会话在跑时中栏会跟着高频重渲染。每次重渲染都新造 node/edge 对象的话,
		 * React Flow 会把它们当成新节点重新 adopt:`measured` 归零 → 边被卸载重挂 →
		 * 边标签(要等 useEffect 里的 getBBox 才量出尺寸)先 hidden 再 visible,肉眼就是「字在闪」。
		 * 同一份投影 + 同一个选中态 = 同一组对象;选中一个点也只换那一个节点对象(按签名缓存)。
		 */
		function graphViewOf({ lexicon, layer, toggled, dragged, selectedId, entityKnowledge, nodeCache, setToggled }) {
			const graph = lexicon?.graph ?? EMPTY_GRAPH
			const conflicts = Array.isArray(lexicon?.conflicts) ? lexicon.conflicts : []
			const conflicted = new Set(conflicts.flatMap((item) => item.sides.map((side) => side.fact)).filter((id) => typeof id === 'string'))
			const layerNodes = graph.nodes.filter((node) => node.layer === layer)
			const layerEdges = graph.edges.filter((edge) => edge.layer === layer && typeof edge.from === 'string' && typeof edge.to === 'string')
			const nodeById = new Map(layerNodes.map((node) => [node.id, node]))

			/**
			 * **目录嵌套就是子图**:概念的父是 `node.parent`(is_a),实体的父是 `node.container`(组成)。
			 * 一个父可以收起,收起后它的整棵子树藏起来,子树上的边改连到这个父身上(去掉自环、去重)。
			 * 点多(> 40)时默认收到第一层,点开 +N 再往下看;点少时全展开。
			 */
			const parentOf = (node) => {
				const id = node.kind === 'concept' ? (typeof node.parent === 'string' && node.parent !== '' ? `term:${node.parent}` : null) : (node.container ?? null)
				return id !== null && id !== node.id && nodeById.has(id) ? id : null
			}
			const parentById = new Map(layerNodes.map((node) => [node.id, parentOf(node)]))
			const childCount = new Map()
			for (const [, parent] of parentById) if (parent !== null) childCount.set(parent, (childCount.get(parent) ?? 0) + 1)
			const depthOfNode = (id) => {
				let depth = 0
				const seen = new Set([id])
				for (let at = parentById.get(id); at !== null && at !== undefined && !seen.has(at); at = parentById.get(at)) {
					seen.add(at)
					depth += 1
				}
				return depth
			}
			const crowded = layerNodes.length > 40
			const isCollapsed = (id) => (childCount.get(id) ?? 0) > 0 && (toggled[id] ?? (crowded && depthOfNode(id) >= 1))
			/** 往上找第一个没被收起的祖先挡住的点:自己可见就是自己。 */
			const shownAs = (id) => {
				let shown = id
				const seen = new Set([id])
				for (let at = parentById.get(id); at !== null && at !== undefined && !seen.has(at); at = parentById.get(at)) {
					seen.add(at)
					if (isCollapsed(at)) shown = at
				}
				return shown
			}
			const hiddenUnder = new Map()
			for (const node of layerNodes) {
				const shown = shownAs(node.id)
				if (shown !== node.id) hiddenUnder.set(shown, (hiddenUnder.get(shown) ?? 0) + 1)
			}
			const allNodes = layerNodes.filter((node) => shownAs(node.id) === node.id)
			const allEdges = (() => {
				const out = []
				const seen = new Set()
				for (const edge of layerEdges) {
					const from = nodeById.has(edge.from) ? shownAs(edge.from) : edge.from
					const to = nodeById.has(edge.to) ? shownAs(edge.to) : edge.to
					if (from === to) continue
					if (from === edge.from && to === edge.to) {
						out.push(edge)
						continue
					}
					const key = `${edge.kind}|${edge.label ?? ''}|${from}|${to}`
					if (seen.has(key)) continue
					seen.add(key)
					out.push({ ...edge, id: `${edge.id}@${from}>${to}`, from, to })
				}
				return out
			})()
			/**
			 * 收起/展开用**函数式更新**读当下的 `toggled`:节点对象会被缓存复用,
			 * 闭包里存旧状态的话,复用节点的折叠按钮会按上一帧的状态去翻。
			 */
			const toggle = (id) => setToggled((current) => {
				const collapsed = (childCount.get(id) ?? 0) > 0 && (current[id] ?? (crowded && depthOfNode(id) >= 1))
				return { ...current, [id]: !collapsed }
			})
			const countOf = (name) => graph.nodes.filter((node) => node.layer === name).length
			const entityNames = new Map(graph.nodes.filter((node) => node.kind === 'instance' && typeof node.ref === 'string' && node.ref !== '' && node.label !== node.ref).map((node) => [String(node.ref), String(node.label)]))

			/** 图上的标签只放得下一小段:截断加省略号,全文在小卡里。 */
			const trimLabel = (text, limit) => {
				const value = String(text ?? '')
				return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`
			}
			/** 一个点的状态:矛盾 > 废止 > 待核验(只登记、没有写进长期知识的事实)> 平常。 */
			const nodeState = (node) => {
				if (Array.isArray(node.facts) && node.facts.some((id) => conflicted.has(id))) return 'conflict'
				if (node.status === 'deprecated') return 'off'
				if (node.kind !== 'concept' && node.kind !== 'value_type' && node.source === 'asserted' && (node.facts ?? []).length === 0) return 'pending'
				return 'on'
			}

			/**
			 * 小图(十来个点)不跑力导向:几个点、几条边时它常常把点排成一条线。
			 * 改成一圈:连得最多的那个点居中(它是这张图的主语),其余按投影顺序绕一圈——确定、好读。
			 * 点少(六个以内)时不放中心:边都是圈上的弦,不会从某个点身上穿过去、压住它的标签。
			 */
			const small = allNodes.length <= 14
			const ring = (() => {
				if (!small) return null
				const degree = new Map(allNodes.map((node) => [node.id, 0]))
				for (const edge of allEdges) {
					if (degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1)
					if (degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1)
				}
				const hub = allNodes.length >= 7 ? [...allNodes].sort((left, right) => degree.get(right.id) - degree.get(left.id))[0] : null
				const around = allNodes.filter((node) => node !== hub)
				const radius = 120 + around.length * 14
				const out = new Map()
				if (hub !== null) out.set(hub.id, { x: 0, y: 0 })
				around.forEach((node, index) => {
					const angle = -Math.PI / 2 + (index / around.length) * Math.PI * 2
					out.set(node.id, { x: Math.cos(angle) * radius * 1.6, y: Math.sin(angle) * radius })
				})
				return out
			})()
			const basePosition = (node) => dragged[node.id] ?? ring?.get(node.id) ?? { x: node.x ?? 0, y: node.y ?? 0 }
			/**
			 * 坐标 = 力导向松弛过的投影坐标(起点确定 ⇒ 同一份账本同一张图)。
			 * 力导向会把它收到的节点整个换成新对象,所以**先算坐标、后建节点对象**;
			 * 反过来的话缓存下来的节点身份会在布局那一步丢掉。
			 */
			const positions = small
				? new Map(allNodes.map((node) => [node.id, basePosition(node)]))
				: (() => {
						const laidOut = forceLayout(
							allNodes.map((node) => ({ id: node.id, position: basePosition(node) })),
							allEdges.map((edge) => ({ source: edge.from, target: edge.to })),
						)
						const out = new Map(allNodes.map((node) => [node.id, basePosition(node)]))
						for (const node of laidOut) {
							const x = node?.position?.x
							const y = node?.position?.y
							if (Number.isFinite(x) && Number.isFinite(y)) out.set(node.id, { x, y })
						}
						return out
					})()

			/**
			 * 投影节点 → React Flow 节点。坐标 = 上面算好的位置。
			 * 尺寸显式给:只写在 style 里的话,React Flow 要等测量完成才知道它多大。
			 * 对象身份按**签名**守:内容没变就复用上一次那个对象,内容真变了才重建。
			 */
			const cache = nodeCache.current ?? new Map()
			const rfNodes = allNodes.map((node) => {
				const position = positions.get(node.id) ?? { x: 0, y: 0 }
				const state = nodeState(node)
				const selected = node.id === selectedId
				const labelText = trimLabel(node.kind === 'value_type' ? (FORM_WORD[node.ref] ?? node.label ?? node.ref) : (node.label ?? node.ref ?? node.id), 16)
				const counts = node.layer === 'entity' ? entityKnowledge?.[node.id]?.counts : undefined
				const children = childCount.get(node.id) ?? 0
				const collapsed = children > 0 ? isCollapsed(node.id) : false
				const foldText = children > 0 ? (collapsed ? `+${hiddenUnder.get(node.id) ?? 0}` : '−') : ''
				const signature = [node.id, node.kind, node.ref ?? '', position.x, position.y, selected ? 1 : 0, state, labelText, foldText, counts === undefined ? '' : JSON.stringify(counts)].join('\u0001')
				const cached = cache.get(node.id)
				if (cached !== undefined && cached.signature === signature) return cached.node
				const rfNode = {
					id: node.id,
					type: 'default',
					position,
					initialWidth: 120,
					initialHeight: 26,
					selected,
					data: {
						label: h(
							'span',
							{ className: 'clearai-star', 'data-kind': node.kind, 'data-state': state, 'data-sel': selected ? '1' : '0' },
							h('i', null),
							h('span', null, labelText),
							node.layer === 'entity' ? h(CountMarks, { counts }) : null,
							children > 0
								? h(
										'b',
										{
											className: 'clearai-fold',
											title: collapsed ? t('展开下一层') : t('收起下一层'),
											onClick: (event) => {
												event.stopPropagation()
												toggle(node.id)
											},
										},
										foldText,
									)
								: null,
						),
					},
					className: 'clearai-star-node',
					style: { background: 'transparent', border: 0, padding: 0, width: 'auto', boxShadow: 'none' },
				}
				cache.set(node.id, { signature, node: rfNode })
				return rfNode
			})
			/** 塌掉/移除的分支不在图上了:缓存里只留当前层还认识的点。 */
			for (const id of [...cache.keys()]) if (!nodeById.has(id)) cache.delete(id)

			/** 投影边 → React Flow 边:实线已验证、虚线待核验、淡线上下位、告警色是矛盾。 */
			const edgeTone = (edge) => {
				if (edge.kind === 'assertion' && conflicted.has(edge.fact)) return { stroke: 'var(--dsw-alias-state-warn-primary)', strokeWidth: 1.4 }
				if (edge.kind === 'is_a') return { stroke: 'var(--dsw-alias-border-l3)', strokeWidth: 1, strokeDasharray: '1 3' }
				if (edge.status === 'retracted') return { stroke: 'var(--dsw-alias-border-l2)', strokeWidth: 1, strokeDasharray: '2 4' }
				if (edge.kind === 'assertion' && edge.status !== 'live') return { stroke: 'var(--dsw-alias-label-tertiary)', strokeWidth: 1.1, strokeDasharray: '5 4' }
				return { stroke: edge.kind === 'assertion' ? 'var(--dsw-alias-label-secondary)' : 'var(--dsw-alias-label-tertiary)', strokeWidth: edge.kind === 'assertion' ? 1.3 : 1 }
			}
			const rfEdges = allEdges.map((edge) => ({
				id: edge.id,
				source: edge.from,
				target: edge.to,
				type: 'straight',
				label: edge.kind === 'is_a' ? '' : (edge.label ?? ''),
				labelStyle: { fontSize: 10, fill: 'var(--dsw-alias-label-secondary)' },
				labelBgStyle: { fill: 'var(--dsw-alias-bg-base)', fillOpacity: 0.9 },
				labelBgPadding: [3, 1],
				style: edgeTone(edge),
			}))

			return {
				rfNodes,
				rfEdges,
				allNodes,
				allEdges,
				nodeById,
				entityNames,
				countOf,
				conflicts,
				graphKey: `${layer}|${layerNodes.length}|${layerEdges.length}`,
			}
		}

		const GraphBand = ({ lexicon, data, send, layer, onLayer, fullscreen, onToggleFullscreen, onFilter, sessionId, unlanded, focus }) => {
			const [picked, setPicked] = React.useState(null)
			const [asked, setAsked] = React.useState({})
			const [toggled, setToggled] = React.useState({})
			const [dragged, setDragged] = React.useState({})
			/** 节点对象缓存:见 graphViewOf。父级重渲染一个都不换,选中只换选中那个。 */
			const nodeCache = React.useRef(new Map())
			const selectedId = picked?.kind === 'node' ? picked.node.id : (focus ?? null)
			React.useEffect(() => {
				setToggled({})
			}, [layer])

			/**
			 * **同一份投影只产出一组 nodes/edges**。会话在跑时中栏会被高频重渲染;
			 * 每次重造对象会让 React Flow 重新 adopt、边被卸载重挂,边标签因此闪。
			 */
			const view = React.useMemo(
				() => graphViewOf({ lexicon, layer, toggled, dragged, selectedId, entityKnowledge: data?.entityKnowledge, nodeCache, setToggled }),
				[lexicon, layer, toggled, dragged, selectedId, data?.entityKnowledge],
			)
			const { rfNodes, rfEdges, allNodes, allEdges, nodeById, entityNames, countOf, conflicts, graphKey } = view
			/** 读时的跨文件检查只标不拦:有问题的那一份不进图,这里说清是哪个文件、哪里不对。 */
			const problems = Array.isArray(lexicon?.problems) ? lexicon.problems : []

			/**
			 * **节点位置是受控的,所以必须自己接住拖动**:不给 `onNodesChange`,
			 * React Flow 内部的拖动没有地方落地,节点根本拖不动。位置是界面状态,换层或图变了就清掉。
			 */
			React.useEffect(() => {
				setDragged({})
			}, [graphKey])
			const onNodesChange = React.useCallback((changes) => {
				setDragged((current) => {
					let next = current
					for (const change of changes) {
						if (change?.type !== 'position' || change.position === undefined) continue
						if (next === current) next = { ...current }
						next[change.id] = change.position
					}
					return next
				})
			}, [])

			const onNodeClick = (_event, node) => {
				const original = nodeById.get(node.id)
				if (original !== undefined) setPicked({ kind: 'node', node: original })
			}
			const onEdgeClick = (_event, edge) => {
				const original = allEdges.find((item) => item.id === edge.id)
				if (original !== undefined) setPicked({ kind: 'edge', edge: original })
			}
			/** 结论那边点了「相关」里的一个主语:当成在图上点了它。 */
			React.useEffect(() => {
				if (focus === null || focus === undefined) return
				const original = nodeById.get(focus)
				if (original !== undefined) setPicked({ kind: 'node', node: original })
			}, [focus])

			const inspection =
				picked === null
					? null
					: picked.kind === 'edge'
						? { kind: 'edge', id: picked.edge.id, label: picked.edge.label }
						: { kind: picked.node.kind, id: picked.node.kind === 'concept' ? String(picked.node.ref ?? '') : picked.node.id, label: picked.node.label ?? picked.node.ref ?? picked.node.id }
			/** 「只看相关」:概念筛概念、实例筛实体、断言边筛谓词。 */
			const filterTarget = picked === null ? null : picked.kind === 'edge' ? (picked.edge.predicate ?? null) : String(picked.node.ref ?? '')

			/**
			 * React Flow 的**实例**(用来适配)要从 `onInit` 拿:v12 里 ref 拿到的是 DOM 节点,
			 * 在它上面调 `fitView` 会静默变成空操作。画布的几何或内容变了就重新适配一次。
			 */
			const rfRef = React.useRef(null)
			React.useEffect(() => {
				const timer = setTimeout(() => rfRef.current?.fitView?.({ padding: 0.18, duration: 200 }), 60)
				return () => clearTimeout(timer)
			}, [fullscreen, layer, picked !== null, allNodes.length])

			/**
			 * **Escape 退出全屏**(issue #33)。
			 *
			 * 全屏是自画的覆盖层,不是原生 Fullscreen API,所以浏览器不会自己给退出键;
			 * 退出入口又只有一个文字链接。这里挂一个 window 级监听(焦点在画布任意位置都能退,
			 * 退出全屏或卸载时摘掉),并在根节点上同时接 onKeyDown —— 事件在组件内冒泡时同样生效,
			 * 且这条接线在测试里可以直接验。
			 */
			React.useEffect(() => {
				if (fullscreen !== true || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return undefined
				const onKey = (event) => { if (event?.key === 'Escape') onToggleFullscreen() }
				window.addEventListener('keydown', onKey)
				return () => window.removeEventListener('keydown', onKey)
			}, [fullscreen, onToggleFullscreen])

			/** 全屏时小卡走右侧抽屉:摆在画布下方会把画布压矮,刚点开的那个点直接掉出可视区。 */
			const sideBySide = fullscreen === true
			const empty =
				layer === 'entity'
					? `${typeof unlanded === 'number' && unlanded > 0 ? `${t('共 ')}${unlanded}${t(' 条断言的主体尚未建立实体文件。')}` : t('实体图暂无内容。')}${t('clear/ontology/entities/ 下的实体文件与写入长期知识的断言将在此显示。')}`
					: t('本体图暂无内容。模型在 clear/ontology/concepts/ 与 relations/ 下建立概念与关系文件后,将在此显示。')
			return h(
				'div',
				{
					className: 'clearai-graph',
					'data-full': fullscreen === true ? '1' : '0',
					/** 覆盖层内也认 Escape(见上面的 window 监听):两条一起,焦点在哪都能退。 */
					onKeyDown: fullscreen === true ? (event) => { if (event?.key === 'Escape') onToggleFullscreen() } : undefined,
				},
				h(
					'div',
					{ className: 'clearai-graph-bar' },
					h(
						'span',
						{ className: 'clearai-seg' },
						h('span', { 'data-on': layer === 'ontology' ? '1' : '0', onClick: () => { setPicked(null); onLayer('ontology') } }, `${t('本体图')} ${countOf('ontology')}`),
						h('span', { 'data-on': layer === 'entity' ? '1' : '0', onClick: () => { setPicked(null); onLayer('entity') } }, `${t('实体图')} ${countOf('entity')}`),
					),
					h(
						'span',
						{ className: 'clearai-legend' },
						h('span', { 'data-l': 'solid' }, t('已验证')),
						h('span', { 'data-l': 'dash' }, t('待核验')),
						layer === 'entity' ? h('span', { className: 'clearai-kcount-legend' }, ...COUNT_ORDER.map((key) => h('span', { key }, h('em', { 'data-b': key }), COUNT_WORD[key]))) : null,
						conflicts.length > 0 ? h('span', { 'data-l': 'warn' }, `${t('矛盾')} ${conflicts.length}`) : null,
					),
					h('span', { style: { flex: '1 1 auto' } }),
					allNodes.length === 0 ? null : h('span', { className: 'clearai-link', onClick: () => rfRef.current?.fitView?.({ padding: 0.18, duration: 200 }) }, t('适配')),
					h('span', { className: 'clearai-link', 'data-exit': '1', onClick: onToggleFullscreen }, fullscreen === true ? `${t('退出全屏')} (Esc)` : t('全屏')),
				),
				h(
					'div',
					{ className: 'clearai-graph-body', 'data-side': sideBySide ? '1' : '0' },
					XYFlow === null || XYFlow.ReactFlow === undefined || XYFlow.ReactFlow === null
						? h('div', { className: 'clearai-graph-empty' }, `${t('图组件不可用')}(${String(XYFLOW_LOAD.reason ?? '')}):${t('结论仍可正常查看。')}`)
						: allNodes.length === 0
							? h('div', { className: 'clearai-graph-empty' }, empty)
							: h(
									'div',
									{ className: 'clearai-graph-canvas' },
									h(
										XYFlow.ReactFlow,
										{
											onInit: (instance) => {
												rfRef.current = instance
											},
											onNodesChange,
											nodes: rfNodes,
											edges: rfEdges,
											onNodeClick,
											onEdgeClick,
											onPaneClick: () => setPicked(null),
											fitView: true,
											minZoom: 0.2,
											maxZoom: 3,
											proOptions: { hideAttribution: true },
											style: { background: 'transparent' },
											nodesDraggable: true,
											nodesConnectable: false,
											elementsSelectable: true,
											panOnDrag: true,
											zoomOnScroll: true,
											zoomOnDoubleClick: false,
										},
										h(XYFlow.Controls, { showInteractive: false }),
										h(XYFlow.Background, { variant: 'dots', gap: 22, size: 1, color: 'var(--dsw-alias-border-l2)' }),
									),
								),
					picked === null
						? null
						: h(
								'div',
								{ className: 'clearai-graph-side' },
								picked.kind === 'node' && picked.node.layer === 'entity' && picked.node.kind === 'instance' ? h(EntityCard, { node: picked.node, data, send, sent: asked, onSent: (key, kind) => setAsked({ ...asked, [key]: kind }) }) : null,
								h(GraphInspector, { selection: inspection, sessionId, names: entityNames, onFilter: () => onFilter(filterTarget), onClose: () => setPicked(null) }),
							),
				),
				/** 读时的跨文件检查只标不拦:有问题的那一份不进图,这里说清是哪个文件、哪里不对。 */
				problems.length === 0
					? null
					: h(
							'details',
							{ className: 'clearai-graph-problems' },
							h('summary', null, `${t('本体文件有 ')}${problems.length}${t(' 项问题(不纳入图中)')}`),
							...problems.slice(0, 12).map((item, index) =>
								h('div', { key: `${item.path ?? ''}#${index}`, 'data-sev': item.severity === 'error' ? 'error' : item.severity === 'info' ? 'info' : 'warning' }, h('code', null, String(item.path ?? '')), ` ${String(item.detail ?? item.code ?? '')}`),
							),
							problems.length > 12 ? h('div', null, `… ${problems.length - 12}`) : null,
						),
			)
		}

		const LocalizedFacts = withLocale(Atlas)
		const LocalizedExplore = withLocale(ExploreView)

		/** 会话预设的 id:面板只在这个模式的会话里出现。 */
		const PRESET_ID = 'clearai'

		function apply(ctx) {
			// 这四个服务都声明在 `inject` 里,所以这里直接用属性读(Cordis 保证就位);
			// 用 `ctx.get()` 也读得到,但属性形式同时受 inject 的「服务重载后重新激活」保护。
			const { slots, sessions, sidebarRight } = ctx
			/**
			 * 语言:接 DSH 原生的 locale 座位(可选 —— 老宿主或测试桩里没有它,面板退化成中文)。
			 * 词典以**源文**为键注册进那个座位,于是 `t('已提出')` 走的是宿主那条查找链:
			 * 缺一条英文就落回中文,而不是显示成 key。
			 */
			const locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined
			if (locale !== undefined && typeof locale.bind === 'function') {
				ctx.effect(() => locale.register(LOCALE_NS, { zh: LOCALE_ZH, en: LOCALE_EN }), 'clearai: locale dictionaries')
				localeBound = locale.bind(LOCALE_NS)
				/**
				 * 语言变了要做两件事:① 让**组件**重画;② 把**座位重挂**一遍。
				 *
				 * ② 不是洁癖:座位上的标签是**注册那一刻**求值的,只重画组件的话,中栏页签会
				 * 停在上一种语言(失效模式:整页已经切成中文,页签还写着 Deliverables / Facts)。
				 * 走宿主自己的 `locale/change` 事件(它声明了这个事件,也正是为这种情况留的)。
				 */
				ctx.effect(() => {
					const onLocaleChange = () => {
						localeBound = locale.bind(LOCALE_NS)
						for (const listener of localeListeners) listener()
						for (const resync of localeResyncs) resync()
					}
					// 事件的订阅走宿主自己的 ctx.on;拿不到就退化成"只绑一次"(老宿主仍然能用,只是切语言要刷新)。
					if (typeof ctx.on !== 'function') return () => {}
					const off = ctx.on('locale/change', onLocaleChange)
					return typeof off === 'function' ? off : () => {}
				}, 'clearai: locale change')
			}
			// 面板的 CSS(原生那套药丸按钮与主题令牌):带 data-plugin 标记,插件卸载时一起收掉。
			ctx.effect(installStyles, 'clearai: panel css')

			/**
			 * **当前主视图里的那个会话**。
			 *
			 * 这里原来是 `sessions.list.getSnapshot().current`(照抄当年的原生 chat)。宿主的
			 * `SessionListState` 现在只有 `{ ids, byId, phase, projectionsBySession }` —— **没有
			 * `current`**:读到的永远是 `undefined`,于是 `isCurrentPreset()` 恒为 false,
			 * `occupy()` / `syncRail()` **一个座位都不注册**。失效形态:模式在、宿主半一切正常、
			 * 右栏只剩宿主自带的页签、中栏没有「产物」——而且不报错。
			 *
			 * 宿主自己的取法(两处都用它):在 `byId` 里找 `retainedBy.mainView > 0` 的那一行
			 * (`dsh-client-ui-open-in-app`、`dsh-client-ui-agent-preset`)。老宿主若还留着
			 * `current`,照旧认它——那一份更精确。
			 */
			const currentSessionRow = () => {
				try {
					const state = sessions.list.getSnapshot()
					if (state === undefined || state === null) return undefined
					if (typeof state.current === 'string' && state.current !== '') return state.byId?.[state.current]
					return Object.values(state.byId ?? {}).find((row) => (row?.retainedBy?.mainView ?? 0) > 0)
				} catch {
					return undefined
				}
			}
			const isCurrentPreset = () => {
				try {
					const preset = currentSessionRow()?.projectionValues?.agentPreset
					return typeof preset === 'string' && preset === PRESET_ID
				} catch {
					return false
				}
			}

			/** 打开一个子会话(旁观)。两个服务都问一遍,拿不到就返回 undefined——组件会退化成文本。 */
			const openSpectator = (id) => {
				if (typeof sessions.open === 'function') return sessions.open(id)
				const workspace = ctx.get('uiWorkspace')
				if (workspace !== undefined && typeof workspace.openSession === 'function') return workspace.openSession(id)
				return undefined
			}

			const seats = []
			/**
			 * `options` 可以是对象,也可以是**函数**。为什么要有函数这一路:座位上的标签在
			 * 注册那一刻就被求值了,传对象等于把语言冻住(失效模式:整页切成中文,页签还写着英文)。
			 * 传函数就让每次注册都重新求值——语言一变重挂一次,标签跟着走。
			 */
			const occupy = (name, options, component) => {
				let disposer = null
				const sync = () => {
					const wanted = isCurrentPreset()
					const resolved = typeof options === 'function' ? options() : options
					if (wanted && disposer === null) {
						disposer = slots.register({ name, ...resolved }, component)
					} else if (!wanted && disposer !== null) {
						disposer()
						disposer = null
					}
				}
				// 注册属于这个 fiber:`ctx.effect` 拿的是 `slots.inject` 的 disposer,
				// 插件被卸载时插座的等待与已经落下的席位一起收掉(原生插件同一写法)。
				ctx.effect(() => slots.inject(name, sync), `clearai: seat ${name}`)
				seats.push(sync)
				localeResyncs.add(() => {
					if (disposer === null) return
					disposer()
					disposer = null
					sync()
				})
			}

			/**
			 * **右栏不再注册页签**:世界树(计划的步骤与闸门)并入探索货架的「过程记录」。
			 * 过程与结果各占中栏一格(探索 / 本体),人不必在右栏与中栏之间来回找。
			 *
			 * 切中栏视图走原生正门 `layout.selectPanel`;座位自己的 props 里有 `openView` 时优先用它。
			 * `selectPanel` 对未注册的 key 会抛 ⇒ 包起来,点不动也不把面板带下水。
			 */
			const openPanel = (props, id) => {
				if (typeof props?.openView === 'function') {
					try {
						props.openView(id)
						return true
					} catch {
						/* 退到 layout 那一路 */
					}
				}
				const layout = ctx.get('layout')
				if (layout === undefined || typeof layout.selectPanel !== 'function') return false
				try {
					layout.selectPanel(id)
					return true
				} catch {
					return false
				}
			}
			/**
			 * 「立为问题 / 暂缓」:替人往这个会话里发一句话(与人在输入框里打字同一条路)。
			 * 对话服务按会话作用域取(`sessions.scope(id)` 上的 `conversation`);拿不到就返回 false,
			 * 界面如实说「请在对话中说明」。这里不写任何账:状态由模型的 Frame 修订落下。
			 */
			const sendFor = (props) => (text) => {
				const id = sessionIdFor(props)
				if (typeof id !== 'string' || typeof sessions.scope !== 'function') return false
				try {
					const scoped = sessions.scope(id)
					const conversation = typeof scoped?.get === 'function' ? scoped.get('conversation') : scoped?.conversation
					if (conversation === undefined || conversation === null || typeof conversation.send !== 'function') return false
					Promise.resolve(conversation.send(text)).catch(() => {})
					return true
				} catch {
					return false
				}
			}

			/**
			 * 这条行所属的会话 id —— 预览地址里那一段**必须是它**。
			 *
			 * 一个修过的 bug:原来这里是
			 * `openPreview = (path) => openNativePreview(sidebarRight, typeof path === 'string' ? path : '', path)` ——
			 * 第二参本该是**会话 id**,却把路径塞了进去。于是地址成了
			 * `dsh-resource://file/session/products%2Freport.html`,原生读面按 SessionId 查不到
			 * 工作区根,点每一条产物都报
			 * `lookup provider "workspaceFileScope" did not resolve the requested identity`。
			 * 三处入口(产物 / 技能 / 记忆文件)共用这一个闭包,所以是一处坏、三处全坏。
			 *
			 * 取法:座位自己的 `props.sessionId` 优先(更精确);props 没有时兜底读当前会话
			 * (`currentSessionRow`,见上)。兜底在这里成立,是因为面板**只在当前会话的预设是
			 * clearai 时挂载**(`isCurrentPreset`,见上),会话切走时面板先注销 ——
			 * 不存在「面板还挂着、行的会话已经换了」的窗口。
			 */
			const sessionIdFor = (props) => {
				const fromProps = props === null || props === undefined ? undefined : props.sessionId
				if (typeof fromProps === 'string' && fromProps !== '') return fromProps
				const id = currentSessionRow()?.id
				return typeof id === 'string' && id !== '' ? id : undefined
			}
			/** 每个座位按自己的 props 造一个打开器:共用一个「反正差不多」的闭包就是上面那个 bug。 */
			const openPreviewFor = (props) => (path) => openNativePreview(sidebarRight, sessionIdFor(props), path)

			/**
			 * 中栏两格:**探索**(过程:问题、候选假设、下一步、过程记录)与**本体**(结果:结论、本体图、
			 * 已确立的事实、经验)。本体货架与模型读的 `clear/knowledge/facts/INDEX.md` 是**同一张表**。
			 *
			 * 注册时必须把**打开器**都交下去:证据的出处、事实原件、两格之间的跳转全靠它们。
			 * 漏了它们,界面看着能点、点了什么也不会发生。
			 */
			occupy('conversation.view', () => ({ id: 'clearai-explore', order: 19, label: t('探索') }), (props) =>
				h(LocalizedExplore, { ...props, openSpectator, openPreview: openPreviewFor(props), send: sendFor(props), openFacts: () => openPanel(props, 'clearai-facts') }),
			)
			occupy('conversation.view', () => ({ id: 'clearai-facts', order: 20, label: t('本体') }), (props) => h(LocalizedFacts, { ...props, openSpectator, openPreview: openPreviewFor(props), send: sendFor(props), openExplore: () => openPanel(props, 'clearai-explore') }))
			// Plan progress uses DSH's native todo dock; no composer chip or shadow plan slot.

			ctx.effect(() => sessions.list.subscribe(() => {
				for (const sync of seats) sync()
			}), t('clearai-loop: 席位跟着会话预设进出'))
		}

		exports.apply = apply
		exports.inject = inject
		/**
		 * 测试缝:世界树的拓扑摊平是**纯函数**,而渲染本身没法在没浏览器的地方验。
		 * 把它导出,好让 `test/client.test.mjs` 直接断言拓扑(线性 / 分叉 / 收敛三种形态)。
		 * 不是给别的包用的接口——真要复用,该搬进宿主侧的 fold。
		 */
		exports.__topology = { treeRows, treeConns, railPath, treeMarks, treeArcs, arcDash, treeLoops, TREE, TREE_COLOR, rowIndexOf, treeFocus, factsFocus, propositionForStep }
		/**
		 * 测试缝之二:把组件本身交出去,好让测试用一个「渲染成字符串」的 React 桩
		 * 真的跑一遍渲染路径(捕 undefined 字段访问这类只有渲染时才炸的错)。
		 * 仍然不是给别的包用的接口。
		 */
		exports.__components = { WorldTree, ExploreView, AnswerCards, QuestionBox, NextBox, EmergentActions, GraphBand, GraphInspector, NeedYou, TreeDetail, Atlas, AtlasHeader, ConclusionList, ConclusionRow, ConclusionDetail, StationBar, TrustTimeline, ClearAIMark, LOOP_LABEL, EntityCard, KnowledgeFlowBox, KnowledgeItemRow, SettledLine, CountMarks }
		/**
		 * 测试缝之三:命题那一列的**派生**是纯函数(分组、处境、来路、证据链),
		 * 渲染本身没法在没浏览器的地方细究——把它导出去,让测试直接断言派生结果。
		 */
		exports.__propositions = { evidenceOf, originsOf, stepOfFact, conclusionsOf }
		/** 测试缝之四:本体格的过滤判据(纯函数)。 */
		exports.__ontology = { termMatches }
		return module.exports
	},
})
