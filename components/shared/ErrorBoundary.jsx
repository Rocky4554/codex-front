"use client";
import { Component } from "react";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <p className="text-red-400 font-medium">Something went wrong</p>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="mt-2 text-sm text-zinc-400 hover:text-white"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
