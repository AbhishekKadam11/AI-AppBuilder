import { Injectable, EventEmitter, Injector, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeModel } from 'ng-diagram';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  label: string;
  type?: string;
  visible?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

export interface DiagramNode {
  // id: string;
  // data: NodeData;
  // options?: {
  //   position?: NodePosition;
  //   width?: number;
  //   height?: number;
  //   template?: string;
  //   visible?: boolean;
  //   [key: string]: any;
  // };
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  autoSize: boolean;
  resizable: boolean;
  data: {
    appName: string;
    label: string;
    // status: boolean;
    type: string;
    dataSource: any[];
    attribute: { icon: string; url: string };
    visible?: boolean;
  };
}

export interface DiagramEdge {
  // id: string;
  // from: string;
  // to: string;
  // data?: {
  //   label?: string;
  //   color?: string;
  //   [key: string]: any;
  // };
  // options?: {
  //   stroke?: string;
  //   strokeWidth?: number;
  //   [key: string]: any;
  // };
    id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  type: string;
  data?: {
    label?: string;
    color?: string;
    [key: string]: any;
  };
  options?: {
    stroke?: string;
    strokeWidth?: number;
    [key: string]: any;
  };
}

export interface VisibilityEvent {
  nodeId: string;
  visible: boolean;
  timestamp: Date;
}

export interface NodeEvent {
  type: 'click' | 'dblclick' | 'drag' | 'select' | 'update';
  nodeId: string;
  data?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SwimlaneService {

  // ============================================
  // PRIVATE STATE
  // ============================================

  private readonly injector = inject(Injector);
  private nodesSubject = new BehaviorSubject<DiagramNode[]>([]);
  private edgesSubject = new BehaviorSubject<DiagramEdge[]>([]);
  private selectedNodeSubject = new BehaviorSubject<string | null>(null);
  private zoomLevelSubject = new BehaviorSubject<number>(1);

  // ============================================
  // EVENT EMITTERS
  // ============================================

  private visibilityChangeEmitter = new EventEmitter<VisibilityEvent>();
  private nodeEventEmitter = new EventEmitter<NodeEvent>();
  private nodesUpdatedEmitter = new EventEmitter<DiagramNode[]>();
  private edgesUpdatedEmitter = new EventEmitter<DiagramEdge[]>();

  // ============================================
  // PUBLIC OBSERVABLES
  // ============================================

  nodes$: Observable<DiagramNode[]> = this.nodesSubject.asObservable();
  edges$: Observable<DiagramEdge[]> = this.edgesSubject.asObservable();
  selectedNode$: Observable<string | null> = this.selectedNodeSubject.asObservable();
  zoomLevel$: Observable<number> = this.zoomLevelSubject.asObservable();

  // Event observables
  visibilityChange$ = this.visibilityChangeEmitter.asObservable();
  nodeEvent$ = this.nodeEventEmitter.asObservable();
  nodesUpdated$ = this.nodesUpdatedEmitter.asObservable();
  edgesUpdated$ = this.edgesUpdatedEmitter.asObservable();

  // ============================================
  // CONSTRUCTOR - Initialize with sample data
  // ============================================

  constructor() {
    //  this.initializeDefaultData();
  }

  // private initializeDefaultData(): void {
  //   const defaultNodes: DiagramNode[] = [
  //     {
  //       id: 'node-1',
  //       data: {
  //         id: 'node-1',
  //         label: 'Node 1',
  //         type: 'control',
  //         visible: true
  //       },
  //       options: {
  //         position: { x: 100, y: 100 },
  //         width: 150,
  //         height: 80,
  //         template: 'controlTemplate'
  //       }
  //     },
  //     {
  //       id: 'node-2',
  //       data: {
  //         id: 'node-2',
  //         label: 'Node 2',
  //         type: 'target',
  //         visible: true
  //       },
  //       options: {
  //         position: { x: 350, y: 100 },
  //         width: 150,
  //         height: 80,
  //         template: 'targetTemplate'
  //       }
  //     },
  //     {
  //       id: 'node-3',
  //       data: {
  //         id: 'node-3',
  //         label: 'Node 3',
  //         type: 'target',
  //         visible: true
  //       },
  //       options: {
  //         position: { x: 600, y: 100 },
  //         width: 150,
  //         height: 80,
  //         template: 'targetTemplate'
  //       }
  //     }
  //   ];

  //   const defaultEdges: DiagramEdge[] = [
  //     {
  //       id: 'edge-1',
  //       from: 'node-1',
  //       to: 'node-2',
  //       data: { label: 'controls' },
  //       options: { stroke: '#007bff', strokeWidth: 2 }
  //     },
  //     {
  //       id: 'edge-2',
  //       from: 'node-1',
  //       to: 'node-3',
  //       data: { label: 'controls' },
  //       options: { stroke: '#007bff', strokeWidth: 2 }
  //     }
  //   ];

  //   this.setNodes(defaultNodes);
  //   this.setEdges(defaultEdges);
  // }

  public initializeDiagramModel(nodes: DiagramNode[], edges: DiagramEdge[]): void {
    this.setNodes(nodes);
    this.setEdges(edges);
  }

  // ============================================
  // NODE OPERATIONS
  // ============================================

  /**
   * Get all nodes
   */
  getNodes(): DiagramNode[] {
    return this.nodesSubject.getValue();
  }

  /**
   * Set all nodes
   */
  setNodes(nodes: DiagramNode[]): void {
    this.nodesSubject.next(nodes);
    this.nodesUpdatedEmitter.emit(nodes);
  }

  /**
   * Get node by ID
   */
  getNodeById(id: string): DiagramNode | undefined {
    return this.nodesSubject.getValue().find(n => n.id === id);
  }

  /**
   * Add a new node
   */
  addNode(node: DiagramNode): void {
    const nodes = this.getNodes();
    nodes.push(node);
    this.setNodes([...nodes]);
    this.emitNodeEvent('update', node.id, { action: 'add' });
  }

  /**
   * Update existing node
   */
  updateNode(nodeId: string, updates: Partial<DiagramNode>): void {
    const nodes = this.getNodes();
    const index = nodes.findIndex(n => n.id === nodeId);

    if (index !== -1) {
      nodes[index] = { ...nodes[index], ...updates };
      this.setNodes([...nodes]);
      this.emitNodeEvent('update', nodeId, updates);
    }
  }

  /**
   * Update node data
   */
  updateNodeData(nodeId: string, dataUpdates: Partial<NodeData>): void {
    const nodes = this.getNodes();
    const index = nodes.findIndex(n => n.id === nodeId);

    if (index !== -1) {
      nodes[index] = {
        ...nodes[index],
        data: { ...nodes[index].data, ...dataUpdates }
      };
      this.setNodes([...nodes]);
      this.emitNodeEvent('update', nodeId, dataUpdates);
    }
  }

  /**
   * Update node position
   */
  // updateNodePosition(nodeId: string, position: NodePosition): void {
  //   this.updateNode(nodeId, {
  //     options: { position }
  //   });
  // }

  /**
   * Remove node by ID
   */
  removeNode(nodeId: string): void {
    const nodes = this.getNodes().filter(n => n.id !== nodeId);
    this.setNodes(nodes);

    // Also remove connected edges
    const edges = this.getEdges().filter(e => e.source !== nodeId && e.target !== nodeId);
    this.setEdges(edges);

    this.emitNodeEvent('update', nodeId, { action: 'remove' });
  }

  /**
   * Toggle node visibility
   */
  toggleNodeVisibility(nodeId: string): boolean {
    const node = this.getNodeById(nodeId);
    if (!node) return false;

    const newVisible = !(node.data.visible ?? true);

    this.updateNodeData(nodeId, { visible: newVisible });
    // this.updateNodeOptions(nodeId, { visible: newVisible });

    // Emit visibility event
    this.visibilityChangeEmitter.emit({
      nodeId,
      visible: newVisible,
      timestamp: new Date()
    });

    return newVisible;
  }

  /**
   * Set node visibility explicitly
   */
  setNodeVisibility(nodeId: string, visible: boolean): void {
    this.updateNodeData(nodeId, { visible });
    // this.updateNodeOptions(nodeId, { visible });

    this.visibilityChangeEmitter.emit({
      nodeId,
      visible,
      timestamp: new Date()
    });
  }

  /**
   * Update node options
   */
  // updateNodeOptions(nodeId: string, options: any): void {
  //   const nodes = this.getNodes();
  //   const index = nodes.findIndex(n => n.id === nodeId);

  //   if (index !== -1) {
  //     nodes[index] = {
  //       ...nodes[index],
  //       options: { ...nodes[index].options, ...options }
  //     };
  //     this.setNodes([...nodes]);
  //   }
  // }

  // ============================================
  // EDGE OPERATIONS
  // ============================================

  /**
   * Get all edges
   */
  getEdges(): DiagramEdge[] {
    return this.edgesSubject.getValue();
  }

  /**
   * Set all edges
   */
  setEdges(edges: DiagramEdge[]): void {
    this.edgesSubject.next(edges);
    this.edgesUpdatedEmitter.emit(edges);
  }

  /**
   * Get edge by ID
   */
  getEdgeById(id: string): DiagramEdge | undefined {
    return this.edgesSubject.getValue().find(e => e.id === id);
  }

  /**
   * Get edges connected to a node
   */
  getEdgesByNode(nodeId: string): DiagramEdge[] {
    return this.getEdges().filter(e => e.source === nodeId || e.target === nodeId);
  }

  /**
   * Add new edge
   */
  addEdge(edge: DiagramEdge): void {
    const edges = this.getEdges();

    // Check if edge already exists
    const exists = edges.some(e =>
      (e.source === edge.source && e.target === edge.target) ||
      (e.target === edge.source && e.source === edge.target)
    );

    if (!exists) {
      edges.push(edge);
      this.setEdges([...edges]);
    }
  }

  /**
   * Update edge
   */
  updateEdge(edgeId: string, updates: Partial<DiagramEdge>): void {
    const edges = this.getEdges();
    const index = edges.findIndex(e => e.id === edgeId);

    if (index !== -1) {
      edges[index] = { ...edges[index], ...updates };
      this.setEdges([...edges]);
    }
  }

  /**
   * Remove edge by ID
   */
  removeEdge(edgeId: string): void {
    const edges = this.getEdges().filter(e => e.id !== edgeId);
    this.setEdges(edges);
  }

  /**
   * Remove edges connected to a node
   */
  removeEdgesByNode(nodeId: string): void {
    const edges = this.getEdges().filter(
      e => e.source !== nodeId && e.target !== nodeId
    );
    this.setEdges(edges);
  }

  // ============================================
  // VISIBILITY CONTROL (Cross-Node Communication)
  // ============================================

  /**
   * Pass visibility from source node to target node
   */
  passVisibilityToNode(
    sourceNodeId: string,
    targetNodeId: string,
    visible: boolean
  ): void {
    // Update target node visibility
    this.setNodeVisibility(targetNodeId, visible);

    // Create event data
    const visibilityEvent: VisibilityEvent = {
      nodeId: targetNodeId,
      visible,
      timestamp: new Date()
    };

    // Update source node with control action
    this.updateNodeData(sourceNodeId, {
      controlledNode: targetNodeId,
      lastAction: visible ? 'show' : 'hide'
    });

    // Emit visibility change event
    this.visibilityChangeEmitter.emit(visibilityEvent);
  }

  /**
   * Toggle visibility between nodes (bidirectional)
   */
  toggleVisibilityBetween(sourceNodeId: string, targetNodeId: string): boolean {
    const targetNode = this.getNodeById(targetNodeId);
    if (!targetNode) return false;

    const newVisible = !(targetNode.data.visible ?? true);
    this.passVisibilityToNode(sourceNodeId, targetNodeId, newVisible);

    return newVisible;
  }

  /**
   * Show/Hide multiple nodes at once
   */
  setMultipleNodesVisibility(nodeIds: string[], visible: boolean): void {
    nodeIds.forEach(nodeId => {
      this.setNodeVisibility(nodeId, visible);
    });
  }

  // ============================================
  // SELECTION & HIGHLIGHTING
  // ============================================

  /**
   * Select a node
   */
  selectNode(nodeId: string): void {
    this.selectedNodeSubject.next(nodeId);
    this.emitNodeEvent('select', nodeId);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedNodeSubject.next(null);
  }

  /**
   * Get selected node ID
   */
  getSelectedNodeId(): string | null {
    return this.selectedNodeSubject.getValue();
  }

  // ============================================
  // ZOOM OPERATIONS
  // ============================================

  /**
   * Set zoom level
   */
  setZoomLevel(level: number): void {
    const clampedLevel = Math.max(0.1, Math.min(3, level));
    this.zoomLevelSubject.next(clampedLevel);
  }

  /**
   * Get zoom level
   */
  getZoomLevel(): number {
    return this.zoomLevelSubject.getValue();
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.setZoomLevel(this.getZoomLevel() + 0.1);
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.setZoomLevel(this.getZoomLevel() - 0.1);
  }

  /**
   * Reset zoom
   */
  resetZoom(): void {
    this.setZoomLevel(1);
  }

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  /**
   * Export diagram data as JSON
   */
  exportDiagram(): string {
    const data = {
      nodes: this.getNodes(),
      edges: this.getEdges(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import diagram data from JSON
   */
  importDiagram(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.nodes) this.setNodes(data.nodes);
      if (data.edges) this.setEdges(data.edges);
      return true;
    } catch (error) {
      console.error('Failed to import diagram:', error);
      return false;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Clear all nodes and edges
   */
  clearDiagram(): void {
    this.setNodes([]);
    this.setEdges([]);
  }

  /**
   * Get node count
   */
  getNodeCount(): number {
    return this.getNodes().length;
  }

  /**
   * Get edge count
   */
  getEdgeCount(): number {
    return this.getEdges().length;
  }

  /**
   * Check if node exists
   */
  hasNode(nodeId: string): boolean {
    return this.getNodes().some(n => n.id === nodeId);
  }

  /**
   * Check if edge exists
   */
  hasEdge(from: string, to: string): boolean {
    return this.getEdges().some(
      e => (e.source === from && e.target === to) ||
        (e.source === to && e.target === from)
    );
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private emitNodeEvent(
    type: NodeEvent['type'],
    nodeId: string,
    data?: any
  ): void {
    this.nodeEventEmitter.emit({
      type,
      nodeId,
      data,
      timestamp: new Date()
    });
  }

  public reInitializeDiagramModel(): void {
    const edges = this.getEdges().map(edge => ({
      ...edge,
      data: edge.data || {}
    }));
    this.clearDiagram();
    initializeModel({ nodes: this.getNodes(), edges }, this.injector);
  }

}
