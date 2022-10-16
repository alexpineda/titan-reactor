import { log } from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
import React, { ErrorInfo } from "react";

class ErrorBoundary extends React.Component {
    override state: { error: Error | undefined } = { error: undefined };
    override props: { message: string; children: React.ReactNode };

    constructor( props: { message: string; children: React.ReactNode } ) {
        super( props );
        this.props = props;
    }

    static getDerivedStateFromError( error: Error ) {
        return { error };
    }

    override componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
        log.error( withErrorMessage( error, errorInfo.componentStack ) );
    }

    override render() {
        if ( this.state.error ) {
            return (
                <p>
                    {this.props.message + ": "}
                    {this.state.error instanceof Error
                        ? this.state.error.message
                        : "unknown"}{" "}
                </p>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
