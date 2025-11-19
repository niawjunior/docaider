import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Bot, X, MessageCircle } from 'lucide-react';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;
	"production" !== process.env.NODE_ENV &&
	  (function () {
	    function getComponentNameFromType(type) {
	      if (null == type) return null;
	      if ("function" === typeof type)
	        return type.$$typeof === REACT_CLIENT_REFERENCE
	          ? null
	          : type.displayName || type.name || null;
	      if ("string" === typeof type) return type;
	      switch (type) {
	        case REACT_FRAGMENT_TYPE:
	          return "Fragment";
	        case REACT_PROFILER_TYPE:
	          return "Profiler";
	        case REACT_STRICT_MODE_TYPE:
	          return "StrictMode";
	        case REACT_SUSPENSE_TYPE:
	          return "Suspense";
	        case REACT_SUSPENSE_LIST_TYPE:
	          return "SuspenseList";
	        case REACT_ACTIVITY_TYPE:
	          return "Activity";
	      }
	      if ("object" === typeof type)
	        switch (
	          ("number" === typeof type.tag &&
	            console.error(
	              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
	            ),
	          type.$$typeof)
	        ) {
	          case REACT_PORTAL_TYPE:
	            return "Portal";
	          case REACT_CONTEXT_TYPE:
	            return type.displayName || "Context";
	          case REACT_CONSUMER_TYPE:
	            return (type._context.displayName || "Context") + ".Consumer";
	          case REACT_FORWARD_REF_TYPE:
	            var innerType = type.render;
	            type = type.displayName;
	            type ||
	              ((type = innerType.displayName || innerType.name || ""),
	              (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
	            return type;
	          case REACT_MEMO_TYPE:
	            return (
	              (innerType = type.displayName || null),
	              null !== innerType
	                ? innerType
	                : getComponentNameFromType(type.type) || "Memo"
	            );
	          case REACT_LAZY_TYPE:
	            innerType = type._payload;
	            type = type._init;
	            try {
	              return getComponentNameFromType(type(innerType));
	            } catch (x) {}
	        }
	      return null;
	    }
	    function testStringCoercion(value) {
	      return "" + value;
	    }
	    function checkKeyStringCoercion(value) {
	      try {
	        testStringCoercion(value);
	        var JSCompiler_inline_result = !1;
	      } catch (e) {
	        JSCompiler_inline_result = !0;
	      }
	      if (JSCompiler_inline_result) {
	        JSCompiler_inline_result = console;
	        var JSCompiler_temp_const = JSCompiler_inline_result.error;
	        var JSCompiler_inline_result$jscomp$0 =
	          ("function" === typeof Symbol &&
	            Symbol.toStringTag &&
	            value[Symbol.toStringTag]) ||
	          value.constructor.name ||
	          "Object";
	        JSCompiler_temp_const.call(
	          JSCompiler_inline_result,
	          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
	          JSCompiler_inline_result$jscomp$0
	        );
	        return testStringCoercion(value);
	      }
	    }
	    function getTaskName(type) {
	      if (type === REACT_FRAGMENT_TYPE) return "<>";
	      if (
	        "object" === typeof type &&
	        null !== type &&
	        type.$$typeof === REACT_LAZY_TYPE
	      )
	        return "<...>";
	      try {
	        var name = getComponentNameFromType(type);
	        return name ? "<" + name + ">" : "<...>";
	      } catch (x) {
	        return "<...>";
	      }
	    }
	    function getOwner() {
	      var dispatcher = ReactSharedInternals.A;
	      return null === dispatcher ? null : dispatcher.getOwner();
	    }
	    function UnknownOwner() {
	      return Error("react-stack-top-frame");
	    }
	    function hasValidKey(config) {
	      if (hasOwnProperty.call(config, "key")) {
	        var getter = Object.getOwnPropertyDescriptor(config, "key").get;
	        if (getter && getter.isReactWarning) return !1;
	      }
	      return void 0 !== config.key;
	    }
	    function defineKeyPropWarningGetter(props, displayName) {
	      function warnAboutAccessingKey() {
	        specialPropKeyWarningShown ||
	          ((specialPropKeyWarningShown = !0),
	          console.error(
	            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
	            displayName
	          ));
	      }
	      warnAboutAccessingKey.isReactWarning = !0;
	      Object.defineProperty(props, "key", {
	        get: warnAboutAccessingKey,
	        configurable: !0
	      });
	    }
	    function elementRefGetterWithDeprecationWarning() {
	      var componentName = getComponentNameFromType(this.type);
	      didWarnAboutElementRef[componentName] ||
	        ((didWarnAboutElementRef[componentName] = !0),
	        console.error(
	          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
	        ));
	      componentName = this.props.ref;
	      return void 0 !== componentName ? componentName : null;
	    }
	    function ReactElement(type, key, props, owner, debugStack, debugTask) {
	      var refProp = props.ref;
	      type = {
	        $$typeof: REACT_ELEMENT_TYPE,
	        type: type,
	        key: key,
	        props: props,
	        _owner: owner
	      };
	      null !== (void 0 !== refProp ? refProp : null)
	        ? Object.defineProperty(type, "ref", {
	            enumerable: !1,
	            get: elementRefGetterWithDeprecationWarning
	          })
	        : Object.defineProperty(type, "ref", { enumerable: !1, value: null });
	      type._store = {};
	      Object.defineProperty(type._store, "validated", {
	        configurable: !1,
	        enumerable: !1,
	        writable: !0,
	        value: 0
	      });
	      Object.defineProperty(type, "_debugInfo", {
	        configurable: !1,
	        enumerable: !1,
	        writable: !0,
	        value: null
	      });
	      Object.defineProperty(type, "_debugStack", {
	        configurable: !1,
	        enumerable: !1,
	        writable: !0,
	        value: debugStack
	      });
	      Object.defineProperty(type, "_debugTask", {
	        configurable: !1,
	        enumerable: !1,
	        writable: !0,
	        value: debugTask
	      });
	      Object.freeze && (Object.freeze(type.props), Object.freeze(type));
	      return type;
	    }
	    function jsxDEVImpl(
	      type,
	      config,
	      maybeKey,
	      isStaticChildren,
	      debugStack,
	      debugTask
	    ) {
	      var children = config.children;
	      if (void 0 !== children)
	        if (isStaticChildren)
	          if (isArrayImpl(children)) {
	            for (
	              isStaticChildren = 0;
	              isStaticChildren < children.length;
	              isStaticChildren++
	            )
	              validateChildKeys(children[isStaticChildren]);
	            Object.freeze && Object.freeze(children);
	          } else
	            console.error(
	              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
	            );
	        else validateChildKeys(children);
	      if (hasOwnProperty.call(config, "key")) {
	        children = getComponentNameFromType(type);
	        var keys = Object.keys(config).filter(function (k) {
	          return "key" !== k;
	        });
	        isStaticChildren =
	          0 < keys.length
	            ? "{key: someKey, " + keys.join(": ..., ") + ": ...}"
	            : "{key: someKey}";
	        didWarnAboutKeySpread[children + isStaticChildren] ||
	          ((keys =
	            0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}"),
	          console.error(
	            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
	            isStaticChildren,
	            children,
	            keys,
	            children
	          ),
	          (didWarnAboutKeySpread[children + isStaticChildren] = !0));
	      }
	      children = null;
	      void 0 !== maybeKey &&
	        (checkKeyStringCoercion(maybeKey), (children = "" + maybeKey));
	      hasValidKey(config) &&
	        (checkKeyStringCoercion(config.key), (children = "" + config.key));
	      if ("key" in config) {
	        maybeKey = {};
	        for (var propName in config)
	          "key" !== propName && (maybeKey[propName] = config[propName]);
	      } else maybeKey = config;
	      children &&
	        defineKeyPropWarningGetter(
	          maybeKey,
	          "function" === typeof type
	            ? type.displayName || type.name || "Unknown"
	            : type
	        );
	      return ReactElement(
	        type,
	        children,
	        maybeKey,
	        getOwner(),
	        debugStack,
	        debugTask
	      );
	    }
	    function validateChildKeys(node) {
	      isValidElement(node)
	        ? node._store && (node._store.validated = 1)
	        : "object" === typeof node &&
	          null !== node &&
	          node.$$typeof === REACT_LAZY_TYPE &&
	          ("fulfilled" === node._payload.status
	            ? isValidElement(node._payload.value) &&
	              node._payload.value._store &&
	              (node._payload.value._store.validated = 1)
	            : node._store && (node._store.validated = 1));
	    }
	    function isValidElement(object) {
	      return (
	        "object" === typeof object &&
	        null !== object &&
	        object.$$typeof === REACT_ELEMENT_TYPE
	      );
	    }
	    var React$1 = React,
	      REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
	      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
	      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
	      REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
	      REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
	      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
	      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
	      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
	      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
	      REACT_MEMO_TYPE = Symbol.for("react.memo"),
	      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
	      REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
	      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"),
	      ReactSharedInternals =
	        React$1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
	      hasOwnProperty = Object.prototype.hasOwnProperty,
	      isArrayImpl = Array.isArray,
	      createTask = console.createTask
	        ? console.createTask
	        : function () {
	            return null;
	          };
	    React$1 = {
	      react_stack_bottom_frame: function (callStackForError) {
	        return callStackForError();
	      }
	    };
	    var specialPropKeyWarningShown;
	    var didWarnAboutElementRef = {};
	    var unknownOwnerDebugStack = React$1.react_stack_bottom_frame.bind(
	      React$1,
	      UnknownOwner
	    )();
	    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
	    var didWarnAboutKeySpread = {};
	    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	    reactJsxRuntime_development.jsx = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        !1,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	    reactJsxRuntime_development.jsxs = function (type, config, maybeKey) {
	      var trackActualOwner =
	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
	      return jsxDEVImpl(
	        type,
	        config,
	        maybeKey,
	        !0,
	        trackActualOwner
	          ? Error("react-stack-top-frame")
	          : unknownOwnerDebugStack,
	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
	      );
	    };
	  })();
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

function useDocaiderChat(config) {
    var _a, _b, _c;
    const [chatState, setChatState] = useState({
        isOpen: ((_a = config.behavior) === null || _a === void 0 ? void 0 : _a.autoOpen) || false,
        messages: [],
        isLoading: false,
        error: null,
        chatId: null,
    });
    // Initialize chat session
    const initializeChat = useCallback(async () => {
        if (chatState.chatId)
            return;
        setChatState((prev) => (Object.assign(Object.assign({}, prev), { isLoading: true, error: null })));
        try {
            const response = await fetch(`${config.apiEndpoint}/api/embed/initialize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    knowledgeBaseId: config.knowledgeBaseId,
                    referrer: window.location.href,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to initialize chat");
            }
            const data = await response.json();
            setChatState((prev) => (Object.assign(Object.assign({}, prev), { chatId: data.chatId, isLoading: false })));
        }
        catch (error) {
            setChatState((prev) => (Object.assign(Object.assign({}, prev), { error: error instanceof Error ? error.message : "Failed to initialize chat", isLoading: false })));
        }
    }, [config.apiEndpoint, config.knowledgeBaseId, chatState.chatId]);
    // Initialize chat on mount
    useEffect(() => {
        initializeChat();
    }, [initializeChat]);
    // AI SDK chat hook
    const { messages, sendMessage, status, error, stop } = useChat({
        transport: new DefaultChatTransport({
            api: `${config.apiEndpoint}/api/embed/chat`,
            body: {
                chatId: chatState.chatId,
                knowledgeBaseId: config.knowledgeBaseId,
            },
        }),
        id: chatState.chatId,
        onFinish: () => {
            // Auto-focus input after message is complete
        },
    });
    const toggleChat = useCallback(() => {
        setChatState((prev) => (Object.assign(Object.assign({}, prev), { isOpen: !prev.isOpen })));
    }, []);
    const openChat = useCallback(() => {
        setChatState((prev) => (Object.assign(Object.assign({}, prev), { isOpen: true })));
    }, []);
    const closeChat = useCallback(() => {
        setChatState((prev) => (Object.assign(Object.assign({}, prev), { isOpen: false })));
    }, []);
    const handleSendMessage = useCallback((message) => {
        if (message.trim() && status !== "streaming") {
            sendMessage({ text: message });
        }
    }, [sendMessage, status]);
    // Add welcome message if no messages exist
    const displayMessages = messages.length > 0
        ? messages
        : [
            {
                id: "welcome",
                role: "assistant",
                content: ((_b = config.behavior) === null || _b === void 0 ? void 0 : _b.welcomeMessage) ||
                    "Hello! How can I help you today?",
                parts: [
                    {
                        type: "text",
                        text: ((_c = config.behavior) === null || _c === void 0 ? void 0 : _c.welcomeMessage) ||
                            "Hello! How can I help you today?",
                    },
                ],
            },
        ];
    return {
        // State
        isOpen: chatState.isOpen,
        messages: displayMessages,
        isLoading: chatState.isLoading || status === "submitted",
        error: chatState.error || (error === null || error === void 0 ? void 0 : error.message),
        chatId: chatState.chatId,
        status,
        // Actions
        toggleChat,
        openChat,
        closeChat,
        sendMessage: handleSendMessage,
        stop,
        // Config
        config,
    };
}

function MessageInput({ onSendMessage, placeholder = "Ask a question...", disabled = false, primaryColor = "#0091ff", }) {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef(null);
    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [inputValue]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
            onSendMessage(inputValue.trim());
            setInputValue("");
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    return (jsxRuntimeExports.jsx("div", Object.assign({ className: "p-3 border-t border-gray-200" }, { children: jsxRuntimeExports.jsxs("form", Object.assign({ onSubmit: handleSubmit, className: "flex gap-2" }, { children: [jsxRuntimeExports.jsx("textarea", { ref: textareaRef, value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: handleKeyDown, placeholder: placeholder, disabled: disabled, rows: 1, className: "flex-1 resize-none rounded-md border border-gray-300 p-2 outline-none transition-colors focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", style: {
                        minHeight: "40px",
                        maxHeight: "120px",
                    } }), jsxRuntimeExports.jsx("button", Object.assign({ type: "submit", disabled: !inputValue.trim() || disabled, className: "h-10 w-10 rounded-md flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-none outline-none", style: {
                        backgroundColor: primaryColor,
                        color: "#FFFFFF",
                    } }, { children: jsxRuntimeExports.jsx("svg", Object.assign({ className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, { children: jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) })) }))] })) })));
}

function ChatWindow({ messages, isLoading, error, status, config, onClose, onSendMessage, onStop, }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const messagesEndRef = useRef(null);
    // Scroll to bottom when new messages are added
    useEffect(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    return (jsxRuntimeExports.jsxs(motion.div, Object.assign({ initial: { opacity: 0, y: 20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.9 }, className: "bg-white rounded-lg shadow-lg mb-2 overflow-hidden flex flex-col", style: {
            width: (_a = config.appearance) === null || _a === void 0 ? void 0 : _a.width,
            height: (_b = config.appearance) === null || _b === void 0 ? void 0 : _b.height,
            boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
            fontFamily: (_c = config.theme) === null || _c === void 0 ? void 0 : _c.fontFamily,
        } }, { children: [jsxRuntimeExports.jsxs("div", Object.assign({ className: "p-3 flex items-center justify-between", style: {
                    backgroundColor: (_d = config.theme) === null || _d === void 0 ? void 0 : _d.primaryColor,
                    color: (_e = config.theme) === null || _e === void 0 ? void 0 : _e.textColor,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                } }, { children: [jsxRuntimeExports.jsxs("div", Object.assign({ className: "flex items-center gap-2" }, { children: [jsxRuntimeExports.jsx(Bot, { className: "h-5 w-5", style: { color: (_f = config.theme) === null || _f === void 0 ? void 0 : _f.textColor } }), jsxRuntimeExports.jsx("h3", Object.assign({ className: "font-medium" }, { children: (_g = config.appearance) === null || _g === void 0 ? void 0 : _g.title }))] })), jsxRuntimeExports.jsx("div", Object.assign({ className: "flex gap-1" }, { children: jsxRuntimeExports.jsx("button", Object.assign({ className: "h-8 w-8 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors border-none outline-none", onClick: onClose, style: { color: (_h = config.theme) === null || _h === void 0 ? void 0 : _h.textColor } }, { children: jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })) }))] })), jsxRuntimeExports.jsxs("div", Object.assign({ className: "flex-1 overflow-y-auto p-4" }, { children: [messages.map((msg) => {
                        var _a, _b;
                        return (jsxRuntimeExports.jsx("div", Object.assign({ className: `mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}` }, { children: jsxRuntimeExports.jsx("div", Object.assign({ className: `max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-900"}`, style: {
                                    backgroundColor: msg.role === "user" ? (_a = config.theme) === null || _a === void 0 ? void 0 : _a.primaryColor : undefined,
                                } }, { children: (_b = msg.parts) === null || _b === void 0 ? void 0 : _b.map((part, index) => (jsxRuntimeExports.jsx("div", { children: part.type === "text" ? part.text : null }, index))) })) }), msg.id));
                    }), status === "streaming" && (jsxRuntimeExports.jsx("div", Object.assign({ className: "flex justify-start mb-4" }, { children: jsxRuntimeExports.jsx("div", Object.assign({ className: "bg-gray-100 p-3 rounded-lg" }, { children: jsxRuntimeExports.jsxs("div", Object.assign({ className: "flex items-center gap-2" }, { children: [jsxRuntimeExports.jsx("div", { className: "animate-pulse h-2 w-2 rounded-full bg-blue-600" }), jsxRuntimeExports.jsx("span", Object.assign({ className: "text-sm text-gray-600" }, { children: "AI is responding..." }))] })) })) }))), jsxRuntimeExports.jsx("div", { ref: messagesEndRef })] })), error && (jsxRuntimeExports.jsx("div", Object.assign({ className: "px-3 py-2 text-xs text-red-500 bg-red-50 border-t border-red-200" }, { children: jsxRuntimeExports.jsxs("span", { children: ["Error: ", error] }) }))), status === "streaming" && (jsxRuntimeExports.jsx("div", Object.assign({ className: "px-3 py-2 border-t border-gray-200" }, { children: jsxRuntimeExports.jsx("button", Object.assign({ className: "h-6 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors", onClick: onStop }, { children: "Stop" })) }))), jsxRuntimeExports.jsx(MessageInput, { onSendMessage: onSendMessage, placeholder: (_j = config.behavior) === null || _j === void 0 ? void 0 : _j.inputPlaceholder, disabled: status === "streaming", primaryColor: (_k = config.theme) === null || _k === void 0 ? void 0 : _k.primaryColor }), jsxRuntimeExports.jsxs("div", Object.assign({ className: "text-center text-xs p-1 text-gray-500 border-t border-gray-200" }, { children: ["Powered by", " ", jsxRuntimeExports.jsx("a", Object.assign({ href: "https://docaider.com", target: "_blank", rel: "noopener noreferrer", className: "text-purple-600 hover:underline" }, { children: "Docaider" }))] }))] })));
}

function ChatButton({ isOpen, config, onToggle }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return (jsxRuntimeExports.jsx(motion.div, Object.assign({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, className: "flex justify-end" }, { children: jsxRuntimeExports.jsx("button", Object.assign({ onClick: onToggle, className: `shadow-lg ${((_a = config.appearance) === null || _a === void 0 ? void 0 : _a.showButtonText)
                ? "rounded-lg px-4 py-2"
                : "rounded-full"} flex items-center justify-center transition-opacity hover:opacity-90 border-none outline-none`, style: {
                backgroundColor: (_b = config.theme) === null || _b === void 0 ? void 0 : _b.primaryColor,
                color: (_c = config.theme) === null || _c === void 0 ? void 0 : _c.textColor,
                width: ((_d = config.appearance) === null || _d === void 0 ? void 0 : _d.showButtonText)
                    ? "auto"
                    : (_e = config.appearance) === null || _e === void 0 ? void 0 : _e.iconSize,
                height: ((_f = config.appearance) === null || _f === void 0 ? void 0 : _f.showButtonText)
                    ? "auto"
                    : (_g = config.appearance) === null || _g === void 0 ? void 0 : _g.iconSize,
                fontFamily: (_h = config.theme) === null || _h === void 0 ? void 0 : _h.fontFamily,
            } }, { children: isOpen ? (jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })) : (jsxRuntimeExports.jsxs("div", Object.assign({ className: "flex items-center gap-2" }, { children: [jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }), ((_j = config.appearance) === null || _j === void 0 ? void 0 : _j.showButtonText) && (jsxRuntimeExports.jsx("span", Object.assign({ className: "font-medium" }, { children: (_k = config.appearance) === null || _k === void 0 ? void 0 : _k.buttonText })))] }))) })) })));
}

function ChatWidget({ knowledgeBaseId, apiEndpoint = window.location.origin, position = "bottom-right", theme = {}, appearance = {}, behavior = {}, onOpen, onClose, onMessageSent, }) {
    // Merge defaults with provided config
    const config = {
        knowledgeBaseId,
        apiEndpoint,
        chatId: null,
        theme: Object.assign({ primaryColor: "#0091ff", textColor: "#FFFFFF", fontFamily: "system-ui, -apple-system, sans-serif" }, theme),
        appearance: Object.assign({ width: "350px", height: "500px", iconSize: "50px", showButtonText: false, buttonText: "Chat with AI", title: "AI Assistant" }, appearance),
        behavior: Object.assign({ welcomeMessage: "Hello! How can I help you today?", inputPlaceholder: "Ask a question...", autoOpen: false }, behavior),
    };
    const { isOpen, messages, isLoading, error, status, toggleChat, openChat, closeChat, sendMessage, stop, } = useDocaiderChat(config);
    // Handle open/close callbacks
    const handleOpen = React.useCallback(() => {
        openChat();
        onOpen === null || onOpen === void 0 ? void 0 : onOpen();
    }, [openChat, onOpen]);
    const handleClose = React.useCallback(() => {
        closeChat();
        onClose === null || onClose === void 0 ? void 0 : onClose();
    }, [closeChat, onClose]);
    const handleSendMessage = React.useCallback((message) => {
        sendMessage(message);
        onMessageSent === null || onMessageSent === void 0 ? void 0 : onMessageSent(message);
    }, [sendMessage, onMessageSent]);
    // Position classes
    const positionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
    };
    return (jsxRuntimeExports.jsxs("div", Object.assign({ className: `fixed ${positionClasses[position]} z-50` }, { children: [jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && (jsxRuntimeExports.jsx(ChatWindow, { messages: messages, isLoading: isLoading, error: error, status: status, config: config, onClose: handleClose, onSendMessage: handleSendMessage, onStop: stop })) }), jsxRuntimeExports.jsx(ChatButton, { isOpen: isOpen, config: config, onToggle: isOpen ? handleClose : handleOpen })] })));
}

export { ChatButton, ChatWidget, ChatWindow, MessageInput, ChatWidget as default, useDocaiderChat };
//# sourceMappingURL=index.esm.js.map
