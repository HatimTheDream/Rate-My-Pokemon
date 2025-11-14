import React from 'react';
import { Card } from './Atoms';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // In a real app, send to monitoring (Sentry, LogRocket)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Card>
            <div className="p-4 text-center text-rose-200">
              <div className="text-lg font-bold">Something went wrong</div>
              <div className="mt-2 text-sm">Try refreshing the page. If the problem persists, report it.</div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
