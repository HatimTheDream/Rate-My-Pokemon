import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card } from './Atoms';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        // In a real app, send to monitoring (Sentry, LogRocket)
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "p-6", children: _jsx(Card, { children: _jsxs("div", { className: "p-4 text-center text-rose-200", children: [_jsx("div", { className: "text-lg font-bold", children: "Something went wrong" }), _jsx("div", { className: "mt-2 text-sm", children: "Try refreshing the page. If the problem persists, report it." })] }) }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
