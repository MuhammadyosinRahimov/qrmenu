(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/Icon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Icon",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Icon({ name, size = 24, className = "", filled = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `material-symbols-${filled ? "rounded" : "outlined"} ${className}`,
        style: {
            fontSize: size
        },
        children: name
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Icon.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = Icon;
var _c;
__turbopack_context__.k.register(_c, "Icon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function useToast() {
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
_s(useToast, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function ToastProvider({ children }) {
    _s1();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    let toastId = 0;
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[showToast]": (message, type = "success")=>{
            const id = ++toastId;
            setToasts({
                "ToastProvider.useCallback[showToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type
                        }
                    ]
            }["ToastProvider.useCallback[showToast]"]);
            // Auto-remove after 3 seconds
            setTimeout({
                "ToastProvider.useCallback[showToast]": ()=>{
                    setToasts({
                        "ToastProvider.useCallback[showToast]": (prev)=>prev.filter({
                                "ToastProvider.useCallback[showToast]": (t)=>t.id !== id
                            }["ToastProvider.useCallback[showToast]"])
                    }["ToastProvider.useCallback[showToast]"]);
                }
            }["ToastProvider.useCallback[showToast]"], 3000);
        }
    }["ToastProvider.useCallback[showToast]"], []);
    const removeToast = (id)=>{
        setToasts((prev)=>prev.filter((t)=>t.id !== id));
    };
    const getIcon = (type)=>{
        switch(type){
            case "success":
                return "check_circle";
            case "error":
                return "error";
            case "info":
                return "info";
        }
    };
    const getColors = (type)=>{
        switch(type){
            case "success":
                return "bg-green-500 text-white";
            case "error":
                return "bg-red-500 text-white";
            case "info":
                return "bg-blue-500 text-white";
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            showToast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4",
                children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `
              ${getColors(toast.type)}
              flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg
              animate-slide-up pointer-events-auto
              min-w-[200px] max-w-[90vw]
            `,
                        onClick: ()=>removeToast(toast.id),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: getIcon(toast.type),
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/Toast.tsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-sm",
                                children: toast.message
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/Toast.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this)
                        ]
                    }, toast.id, true, {
                        fileName: "[project]/src/components/ui/Toast.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Toast.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Toast.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_s1(ToastProvider, "bva7iOXLAgwOJBzZ6Hx6GD8IQA4=");
_c = ToastProvider;
var _c;
__turbopack_context__.k.register(_c, "ToastProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Providers({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1
                    }
                }
            })
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/src/app/providers.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/providers.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(Providers, "SjLoK+9Ffe3mWJiRHfwwIambVkY=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/cartStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCartStore",
    ()=>useCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        items: [],
        addItem: (item)=>{
            const id = `${item.productId}-${item.sizeId || "default"}-${item.addonIds.sort().join(",")}`;
            const existingItem = get().items.find((i)=>i.id === id);
            if (existingItem) {
                set({
                    items: get().items.map((i)=>i.id === id ? {
                            ...i,
                            quantity: i.quantity + item.quantity,
                            totalPrice: (i.quantity + item.quantity) * i.unitPrice
                        } : i)
                });
            } else {
                set({
                    items: [
                        ...get().items,
                        {
                            ...item,
                            id,
                            totalPrice: item.quantity * item.unitPrice
                        }
                    ]
                });
            }
        },
        removeItem: (itemId)=>{
            set({
                items: get().items.filter((i)=>i.id !== itemId)
            });
        },
        updateQuantity: (itemId, quantity)=>{
            if (quantity <= 0) {
                set({
                    items: get().items.filter((i)=>i.id !== itemId)
                });
            } else {
                set({
                    items: get().items.map((i)=>i.id === itemId ? {
                            ...i,
                            quantity,
                            totalPrice: quantity * i.unitPrice
                        } : i)
                });
            }
        },
        updateItemNote: (itemId, note)=>{
            set({
                items: get().items.map((i)=>i.id === itemId ? {
                        ...i,
                        note
                    } : i)
            });
        },
        clearCart: ()=>set({
                items: []
            }),
        getSubtotal: ()=>{
            return get().items.reduce((sum, item)=>sum + item.totalPrice, 0);
        },
        getTax: ()=>{
            return Math.round(get().getSubtotal() * 0.1);
        },
        getTotal: ()=>{
            return get().getSubtotal() + get().getTax();
        },
        getItemCount: ()=>{
            return get().items.reduce((sum, item)=>sum + item.quantity, 0);
        }
    }), {
    name: "cart-storage",
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    skipHydration: true
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addItemsToOrder",
    ()=>addItemsToOrder,
    "api",
    ()=>api,
    "cancelOrderItem",
    ()=>cancelOrderItem,
    "checkPaymentStatus",
    ()=>checkPaymentStatus,
    "createDeliveryOrder",
    ()=>createDeliveryOrder,
    "createDineInOrder",
    ()=>createDineInOrder,
    "createOrder",
    ()=>createOrder,
    "createPayment",
    ()=>createPayment,
    "createTakeawayOrder",
    ()=>createTakeawayOrder,
    "getActiveOrder",
    ()=>getActiveOrder,
    "getCategories",
    ()=>getCategories,
    "getImageUrl",
    ()=>getImageUrl,
    "getMenu",
    ()=>getMenu,
    "getMySessionInfo",
    ()=>getMySessionInfo,
    "getOrder",
    ()=>getOrder,
    "getOrders",
    ()=>getOrders,
    "getProduct",
    ()=>getProduct,
    "getProducts",
    ()=>getProducts,
    "getRestaurant",
    ()=>getRestaurant,
    "getRestaurantMenu",
    ()=>getRestaurantMenu,
    "getRestaurantStatus",
    ()=>getRestaurantStatus,
    "getRestaurants",
    ()=>getRestaurants,
    "getSignalRUrl",
    ()=>getSignalRUrl,
    "getTableByNumber",
    ()=>getTableByNumber,
    "payForTable",
    ()=>payForTable,
    "requestCashPayment",
    ()=>requestCashPayment,
    "sendOtp",
    ()=>sendOtp,
    "verifyOtp",
    ()=>verifyOtp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:5079";
const getSignalRUrl = ()=>{
    return `${API_BASE_URL}/hubs/orders`;
};
const getImageUrl = (imageUrl)=>{
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
};
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json"
    }
});
// Add auth token to requests
api.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
// Auto-logout on expired token (401)
api.interceptors.response.use((response)=>response, (error)=>{
    if (error.response?.status === 401 && ("TURBOPACK compile-time value", "object") !== "undefined") {
        // Clear expired token
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");
        // Redirect to checkout to re-authenticate
        if (!window.location.pathname.includes("/checkout")) {
            window.location.href = "/checkout";
        } else {
            // If already on checkout, reload to show login form
            window.location.reload();
        }
    }
    return Promise.reject(error);
});
const getCategories = async (menuId)=>{
    const params = menuId ? {
        menuId
    } : {};
    const { data } = await api.get("/categories", {
        params
    });
    return data;
};
const getProducts = async (categoryId, menuId)=>{
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    if (menuId) params.menuId = menuId;
    const { data } = await api.get("/products", {
        params
    });
    return data;
};
const getProduct = async (id)=>{
    const { data } = await api.get(`/products/${id}`);
    return data;
};
const getTableByNumber = async (number)=>{
    const { data } = await api.get(`/tables/by-number/${number}`);
    return data;
};
const getMenu = async (id)=>{
    const { data } = await api.get(`/menus/${id}`);
    return data;
};
const sendOtp = async (phone)=>{
    await api.post("/auth/send-otp", {
        phone
    });
};
const verifyOtp = async (phone, code)=>{
    const { data } = await api.post("/auth/verify-otp", {
        phone,
        code
    });
    return data;
};
const createOrder = async (order)=>{
    const { data } = await api.post("/orders", order);
    return data;
};
const getOrders = async ()=>{
    const { data } = await api.get("/orders");
    return data;
};
const getOrder = async (id)=>{
    const { data } = await api.get(`/orders/${id}`);
    return data;
};
const getActiveOrder = async (tableId)=>{
    try {
        const { data } = await api.get(`/orders/active`, {
            params: {
                tableId
            }
        });
        return data;
    } catch  {
        return null;
    }
};
const addItemsToOrder = async (orderId, items)=>{
    const { data } = await api.post(`/orders/${orderId}/items`, {
        items
    });
    return data;
};
const cancelOrderItem = async (orderId, itemId, reason)=>{
    const { data } = await api.post(`/orders/${orderId}/items/${itemId}/cancel`, {
        reason
    });
    return data;
};
const getRestaurantStatus = async (restaurantId)=>{
    const { data } = await api.get(`/restaurants/${restaurantId}/status`);
    return data;
};
const createPayment = async (request)=>{
    const { data } = await api.post('/payments/create', request);
    return data;
};
const checkPaymentStatus = async (orderId)=>{
    const { data } = await api.get(`/payments/${orderId}/status`);
    return data;
};
const requestCashPayment = async (orderId)=>{
    const { data } = await api.post('/payments/cash', {
        orderId
    });
    return data;
};
const getMySessionInfo = async (tableId)=>{
    try {
        const { data } = await api.get('/tablesessions/my-session', {
            params: {
                tableId
            }
        });
        return data;
    } catch  {
        return null;
    }
};
const payForTable = async (sessionId, paymentMethod)=>{
    const { data } = await api.post(`/tablesessions/${sessionId}/pay-table`, {
        paymentMethod
    });
    return data;
};
const getRestaurants = async (mode)=>{
    const params = mode ? {
        mode
    } : {};
    const { data } = await api.get('/restaurants', {
        params
    });
    return data;
};
const getRestaurant = async (id)=>{
    const { data } = await api.get(`/restaurants/${id}`);
    return data;
};
const getRestaurantMenu = async (restaurantId)=>{
    const { data } = await api.get(`/restaurants/${restaurantId}/menu`);
    return data;
};
const createDeliveryOrder = async (order)=>{
    const { data } = await api.post('/orders/delivery', order);
    return data;
};
const createTakeawayOrder = async (order)=>{
    const { data } = await api.post('/orders/takeaway', order);
    return data;
};
const createDineInOrder = async (order)=>{
    const { data } = await api.post('/orders/dinein', order);
    return data;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/authStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        token: null,
        userId: null,
        phone: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sendOtp: async (phone)=>{
            set({
                isLoading: true,
                error: null
            });
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendOtp"])(phone);
                set({
                    isLoading: false
                });
            } catch (err) {
                set({
                    isLoading: false,
                    error: "Ошибка отправки SMS. Попробуйте снова."
                });
                throw err;
            }
        },
        verifyOtp: async (phone, code)=>{
            set({
                isLoading: true,
                error: null
            });
            try {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyOtp"])(phone, code);
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem("token", response.token);
                }
                set({
                    token: response.token,
                    userId: response.userId,
                    phone: response.phone,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (err) {
                set({
                    isLoading: false,
                    error: "Неверный код. Попробуйте снова."
                });
                throw err;
            }
        },
        logout: ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem("token");
            }
            set({
                token: null,
                userId: null,
                phone: null,
                isAuthenticated: false
            });
        },
        clearError: ()=>set({
                error: null
            })
    }), {
    name: "auth-storage",
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    skipHydration: true,
    partialize: (state)=>({
            token: state.token,
            userId: state.userId,
            phone: state.phone,
            isAuthenticated: state.isAuthenticated
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/tableStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTableStore",
    ()=>useTableStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useTableStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        tableId: null,
        tableNumber: null,
        restaurantId: null,
        restaurantName: null,
        menuId: null,
        menuName: null,
        restaurantPhone: null,
        onlinePaymentAvailable: false,
        setTable: (data)=>set({
                tableId: data.id,
                tableNumber: data.number,
                restaurantId: data.restaurantId || null,
                restaurantName: data.restaurantName || null,
                menuId: data.menuId || null,
                menuName: data.menuName || null,
                restaurantPhone: data.restaurantPhone || null,
                onlinePaymentAvailable: data.onlinePaymentAvailable || false
            }),
        clearTable: ()=>set({
                tableId: null,
                tableNumber: null,
                restaurantId: null,
                restaurantName: null,
                menuId: null,
                menuName: null,
                restaurantPhone: null,
                onlinePaymentAvailable: false
            })
    }), {
    name: "table-storage",
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage)
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/StoreHydration.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreHydration",
    ()=>StoreHydration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/cartStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$tableStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/tableStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function StoreHydration() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoreHydration.useEffect": ()=>{
            // Явная гидрация всех stores из localStorage
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$tableStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTableStore"].persist.rehydrate();
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$cartStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCartStore"].persist.rehydrate();
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"].persist.rehydrate();
        }
    }["StoreHydration.useEffect"], []);
    return null;
}
_s(StoreHydration, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = StoreHydration;
var _c;
__turbopack_context__.k.register(_c, "StoreHydration");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_42085085._.js.map