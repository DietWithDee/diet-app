import React from 'react';

/**
 * AppErrorBoundary Component
 * Catches runtime errors and re-render loops to prevent total site failure.
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  handleReset = () => {
    window.location.href = '/'; // Hard reset to home
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md border-2 border-green-500">
            <div className="text-6xl mb-6">🌿</div>
            <h1 className="text-2xl font-black text-green-700 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We encountered a small bump in the journey. Don't worry, your progress is safe. 
              Click below to refresh and continue.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Reload Dashboard
            </button>
            <p className="mt-6 text-[10px] text-gray-400 font-mono break-all uppercase">
              Error code: {this.state.error?.name || 'UNKNOWN_RECOVERY'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
