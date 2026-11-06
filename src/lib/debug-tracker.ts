/**
 * Debug dimension tracker - captures and stores layout measurements
 * Displays data as an overlay on screen for easy debugging
 */

export interface DimensionData {
  timestamp: string;
  screen: string;
  container: {
    width: number;
    height: number;
    top: number;
    bottom: number;
    scrollHeight: number;
    clientHeight: number;
  };
  header: {
    height: number;
    top: number;
    bottom: number;
  };
  content: {
    height: number;
    top: number;
    bottom: number;
    scrollHeight: number;
    clientHeight: number;
  };
  footer: {
    height: number;
    top: number;
    bottom: number;
  };
  viewport: {
    innerHeight: number;
    innerWidth: number;
  };
  safeArea: {
    supported: boolean;
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  analysis: {
    containerFillsViewport: boolean;
    footerInViewport: boolean;
    footerClipped: boolean;
    contentOverflowsFooter: boolean;
  };
}

class DebugTracker {
  private measurements: DimensionData[] = [];
  private overlayElement: HTMLElement | null = null;

  /**
   * Get safe area inset values
   */
  private getSafeAreaInsets() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Try to get CSS variables
    let top = computedStyle.getPropertyValue('--safe-area-inset-top').trim() || '0px';
    let bottom = computedStyle.getPropertyValue('--safe-area-inset-bottom').trim() || '0px';
    let left = computedStyle.getPropertyValue('--safe-area-inset-left').trim() || '0px';
    let right = computedStyle.getPropertyValue('--safe-area-inset-right').trim() || '0px';

    // Fallback to env() values if CSS variables not set
    if (!top || top === '0px') {
      top = CSS.supports('padding', 'max(env(safe-area-inset-top), 0px)') ? 'env supported' : 'not supported';
    }

    return { top, bottom, left, right };
  }

  /**
   * Analyze the measured data
   */
  private analyzeData(
    containerHeight: number,
    footerTop: number,
    footerHeight: number,
    footerBottom: number,
    contentBottom: number,
    viewportHeight: number
  ): DimensionData['analysis'] {
    const containerFillsViewport = Math.abs(containerHeight - viewportHeight) < 5; // 5px tolerance
    const footerInViewport = footerBottom <= viewportHeight;
    const footerClipped = footerBottom > containerHeight;
    const contentOverflowsFooter = contentBottom > footerTop;

    return {
      containerFillsViewport,
      footerInViewport,
      footerClipped,
      contentOverflowsFooter,
    };
  }

  /**
   * Track dimensions of screen components
   */
  trackDimensions(
    screenName: string,
    containerRef: HTMLElement | null,
    headerRef: HTMLElement | null,
    contentRef: HTMLElement | null,
    footerRef: HTMLElement | null
  ): DimensionData | null {
    if (!containerRef || !headerRef || !contentRef || !footerRef) {
      console.warn('[DebugTracker] Missing refs, skipping measurement');
      return null;
    }

    const containerRect = containerRef.getBoundingClientRect();
    const headerRect = headerRef.getBoundingClientRect();
    const contentRect = contentRef.getBoundingClientRect();
    const footerRect = footerRef.getBoundingClientRect();
    const safeAreaInsets = this.getSafeAreaInsets();

    const data: DimensionData = {
      timestamp: new Date().toLocaleTimeString(),
      screen: screenName,
      container: {
        width: Math.round(containerRect.width),
        height: Math.round(containerRect.height),
        top: Math.round(containerRect.top),
        bottom: Math.round(containerRect.bottom),
        scrollHeight: containerRef.scrollHeight,
        clientHeight: containerRef.clientHeight,
      },
      header: {
        height: Math.round(headerRect.height),
        top: Math.round(headerRect.top),
        bottom: Math.round(headerRect.bottom),
      },
      content: {
        height: Math.round(contentRect.height),
        top: Math.round(contentRect.top),
        bottom: Math.round(contentRect.bottom),
        scrollHeight: contentRef.scrollHeight,
        clientHeight: contentRef.clientHeight,
      },
      footer: {
        height: Math.round(footerRect.height),
        top: Math.round(footerRect.top),
        bottom: Math.round(footerRect.bottom),
      },
      viewport: {
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      },
      safeArea: {
        supported: CSS.supports('padding', 'max(env(safe-area-inset-top), 0px)'),
        top: safeAreaInsets.top,
        bottom: safeAreaInsets.bottom,
        left: safeAreaInsets.left,
        right: safeAreaInsets.right,
      },
      analysis: this.analyzeData(
        containerRect.height,
        footerRect.top,
        footerRect.height,
        footerRect.bottom,
        contentRect.bottom,
        window.innerHeight
      ),
    };

    this.measurements.push(data);
    this.updateOverlay();
    this.logToConsole(data);

    return data;
  }

  /**
   * Log data to console in readable format
   */
  private logToConsole(data: DimensionData) {
    console.group(`📐 ${data.screen} - ${data.timestamp}`);

    console.group('Container');
    console.table(data.container);
    console.groupEnd();

    console.group('Header');
    console.table(data.header);
    console.groupEnd();

    console.group('Content');
    console.table(data.content);
    console.groupEnd();

    console.group('Footer');
    console.table(data.footer);
    console.groupEnd();

    console.group('Viewport');
    console.table(data.viewport);
    console.groupEnd();

    console.group('Safe Area');
    console.table(data.safeArea);
    console.groupEnd();

    console.group('Analysis');
    console.table(data.analysis);
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Create and update the debug overlay
   */
  private updateOverlay() {
    if (!this.overlayElement) {
      this.overlayElement = document.createElement('div');
      this.overlayElement.id = 'debug-tracker-overlay';
      this.overlayElement.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 280px;
        max-height: 400px;
        background: rgba(0, 0, 0, 0.95);
        color: #10b981;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 10px;
        padding: 12px;
        border-radius: 8px;
        overflow-y: auto;
        z-index: 99999;
        border: 2px solid #10b981;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
      `;
      document.body.appendChild(this.overlayElement);
    }

    const latest = this.measurements[this.measurements.length - 1];
    if (!latest) return;

    const { screen, container, header, content, footer, viewport, analysis } = latest;

    const problemsFound: string[] = [];
    if (!analysis.containerFillsViewport) problemsFound.push('Container not filling viewport');
    if (!analysis.footerInViewport) problemsFound.push('Footer below viewport');
    if (analysis.footerClipped) problemsFound.push('❌ FOOTER CLIPPED');
    if (analysis.contentOverflowsFooter) problemsFound.push('Content overlaps footer');

    const html = `
      <div style="margin-bottom: 8px; border-bottom: 1px solid #10b981; padding-bottom: 8px;">
        <strong>📱 ${screen}</strong><br/>
        <small>${latest.timestamp}</small>
      </div>
      
      <div style="margin-bottom: 6px;">
        <strong>Viewport:</strong> ${viewport.innerWidth}×${viewport.innerHeight}
      </div>
      
      <div style="margin-bottom: 6px;">
        <strong>Container:</strong> ${container.width}×${container.height}<br/>
        <small>Fills viewport: ${analysis.containerFillsViewport ? '✓' : '✗'}</small>
      </div>
      
      <div style="margin-bottom: 6px;">
        <strong>Header:</strong> ${header.height}px high
      </div>
      
      <div style="margin-bottom: 6px;">
        <strong>Content:</strong> ${content.height}px / scroll ${content.scrollHeight}px
      </div>
      
      <div style="margin-bottom: 6px;">
        <strong>Footer:</strong> ${footer.height}px high<br/>
        <small>Position: ${Math.round(footer.top)}–${Math.round(footer.bottom)}px</small><br/>
        <small>In viewport: ${analysis.footerInViewport ? '✓' : '✗'}</small><br/>
        <small>Clipped: ${analysis.footerClipped ? '❌ YES' : '✓ No'}</small>
      </div>
      
      <div style="margin-bottom: 6px; border-top: 1px solid #10b981; padding-top: 8px;">
        <strong style="${problemsFound.length > 0 ? 'color: #ef4444;' : 'color: #10b981;'}">
          Issues: ${problemsFound.length}
        </strong><br/>
        ${problemsFound.map(p => `<small>• ${p}</small>`).join('<br/>')}
      </div>
      
      <div style="font-size: 9px; color: #808080; border-top: 1px solid #10b981; padding-top: 6px; margin-top: 6px;">
        Total measurements: ${this.measurements.length}
      </div>
    `;

    this.overlayElement.innerHTML = html;
  }

  /**
   * Get all measurements
   */
  getMeasurements(): DimensionData[] {
    return this.measurements;
  }

  /**
   * Export data as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.measurements, null, 2);
  }

  /**
   * Export data as CSV
   */
  exportCSV(): string {
    if (this.measurements.length === 0) return '';

    const headers = [
      'Timestamp',
      'Screen',
      'Container Height',
      'Header Height',
      'Content Height',
      'Content Scroll Height',
      'Footer Height',
      'Footer Top',
      'Footer Bottom',
      'Viewport Height',
      'Container Fills Viewport',
      'Footer In Viewport',
      'Footer Clipped',
      'Content Overflows Footer',
    ];

    const rows = this.measurements.map(m => [
      m.timestamp,
      m.screen,
      m.container.height,
      m.header.height,
      m.content.height,
      m.content.scrollHeight,
      m.footer.height,
      m.footer.top,
      m.footer.bottom,
      m.viewport.innerHeight,
      m.analysis.containerFillsViewport,
      m.analysis.footerInViewport,
      m.analysis.footerClipped,
      m.analysis.contentOverflowsFooter,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Clear all measurements
   */
  clear() {
    this.measurements = [];
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  /**
   * Hide overlay
   */
  hideOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
  }

  /**
   * Show overlay
   */
  showOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
    }
  }
}

// Export singleton instance
export const debugTracker = new DebugTracker();

// Expose to window for manual access
if (typeof window !== 'undefined') {
  (window as any).debugTracker = debugTracker;
}
