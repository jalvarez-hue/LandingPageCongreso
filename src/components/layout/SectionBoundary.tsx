import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface SectionBoundaryProps {
  children: ReactNode;
  title: string;
}

interface SectionBoundaryState {
  hasError: boolean;
}

export class SectionBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  state: SectionBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`No se pudo renderizar la sección "${this.props.title}".`, error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="cn-section-error" role="alert">
          <h2>No fue posible cargar {this.props.title}.</h2>
          <p>Recarga la página para volver a intentarlo.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
