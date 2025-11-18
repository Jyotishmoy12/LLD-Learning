// ============================================
// PRODUCTION-READY SINGLETON TEMPLATE
// ============================================

/**
 * Basic Singleton Pattern
 * Thread-safe, lazy initialization
 */
export class ServiceName {
  private static instance: ServiceName | null = null;
  private static isCreating = false;

  private constructor() {
    // Prevent instantiation via reflection
    if (ServiceName.instance) {
      throw new Error("Use ServiceName.getInstance() instead of new");
    }
    console.log("ServiceName instance created");
  }

  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      if (ServiceName.isCreating) {
        throw new Error("Circular dependency detected");
      }
      
      ServiceName.isCreating = true;
      try {
        ServiceName.instance = new ServiceName();
      } finally {
        ServiceName.isCreating = false;
      }
    }
    return ServiceName.instance;
  }

  public doSomething(): void {
    console.log("Doing something...");
  }

  // For testing and cleanup
  public static resetInstance(): void {
    ServiceName.instance = null;
  }

  // Cleanup resources
  public destroy(): void {
    // Clean up subscriptions, timers, etc.
    console.log("Cleaning up resources...");
  }
}

// ============================================
// ASYNC SINGLETON (Production Ready)
// ============================================

export class AsyncService {
  private static instance: AsyncService | null = null;
  private static initializationPromise: Promise<void> | null = null;
  private isInitialized = false;
  private data: any = null;

  private constructor() {
    if (AsyncService.instance) {
      throw new Error("Use AsyncService.getInstance()");
    }
  }

  public static getInstance(): AsyncService {
    if (!AsyncService.instance) {
      AsyncService.instance = new AsyncService();
    }
    return AsyncService.instance;
  }

  /**
   * Thread-safe initialization
   * Multiple calls will wait for the same promise
   */
  public async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) {
      return;
    }

    // If initialization is in progress, wait for it
    if (AsyncService.initializationPromise) {
      return AsyncService.initializationPromise;
    }

    // Start initialization
    AsyncService.initializationPromise = this.performInitialization();

    try {
      await AsyncService.initializationPromise;
    } finally {
      AsyncService.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      this.data = await this.fetchData();
      this.isInitialized = true;
      console.log("AsyncService initialized successfully");
    } catch (error) {
      console.error("AsyncService initialization failed:", error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async fetchData(): Promise<any> {
    // Simulate async operation with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve({ initialized: true }), 1000);
      
      // Cleanup on error
      return () => clearTimeout(timeout);
    });
  }

  public getData(): any {
    if (!this.isInitialized) {
      throw new Error("AsyncService not initialized. Call initialize() first.");
    }
    return this.data;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public destroy(): void {
    this.isInitialized = false;
    this.data = null;
    AsyncService.initializationPromise = null;
  }

  public static resetInstance(): void {
    if (AsyncService.instance) {
      AsyncService.instance.destroy();
      AsyncService.instance = null;
    }
  }
}

// ============================================
// CONFIGURABLE SINGLETON (Production Ready)
// ============================================

interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const DEFAULT_CONFIG: Config = {
  apiUrl: "",
  timeout: 5000,
  retries: 3,
};

export class ConfigurableService {
  private static instance: ConfigurableService | null = null;
  private config: Config;

  private constructor(config: Config) {
    if (ConfigurableService.instance) {
      throw new Error("Use ConfigurableService.getInstance()");
    }
    this.validateConfig(config);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<Config>): ConfigurableService {
    if (!ConfigurableService.instance) {
      if (!config?.apiUrl) {
        throw new Error("apiUrl is required for first initialization");
      }
      ConfigurableService.instance = new ConfigurableService(config as Config);
    }
    return ConfigurableService.instance;
  }

  private validateConfig(config: Partial<Config>): void {
    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new Error("Timeout must be positive");
    }
    if (config.retries !== undefined && config.retries < 0) {
      throw new Error("Retries must be non-negative");
    }
  }

  public getConfig(): Readonly<Config> {
    return Object.freeze({ ...this.config });
  }

  public updateConfig(newConfig: Partial<Config>): void {
    this.validateConfig(newConfig);
    this.config = { ...this.config, ...newConfig };
  }

  public destroy(): void {
    // Cleanup
  }

  public static resetInstance(): void {
    if (ConfigurableService.instance) {
      ConfigurableService.instance.destroy();
      ConfigurableService.instance = null;
    }
  }
}

// ============================================
// EVENT EMITTER SINGLETON (Production Ready)
// ============================================

type EventCallback = (...args: any[]) => void;

export class EventService {
  private static instance: EventService | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private maxListeners = 10;

  private constructor() {
    if (EventService.instance) {
      throw new Error("Use EventService.getInstance()");
    }
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;
    
    // Warn about memory leaks
    if (callbacks.size >= this.maxListeners) {
      console.warn(
        `Warning: Possible memory leak detected. ${callbacks.size} listeners added for event "${event}". ` +
        `Use setMaxListeners() to increase limit.`
      );
    }

    callbacks.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  public once(event: string, callback: EventCallback): () => void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  public off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit(event: string, ...args: any[]): boolean {
    const callbacks = this.listeners.get(event);
    if (!callbacks || callbacks.size === 0) {
      return false;
    }

    // Execute callbacks safely
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });

    return true;
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  public setMaxListeners(n: number): void {
    if (n < 0) throw new Error("Max listeners must be non-negative");
    this.maxListeners = n;
  }

  public listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  public destroy(): void {
    this.removeAllListeners();
  }

  public static resetInstance(): void {
    if (EventService.instance) {
      EventService.instance.destroy();
      EventService.instance = null;
    }
  }
}

// ============================================
// REACT HOOK (Production Ready)
// ============================================

import { useEffect, useState, useRef } from "react";

export function useSingleton<T>(
  getInstance: () => T,
  initialize?: (instance: T) => Promise<void>
) {
  const [instance] = useState(() => getInstance());
  const [isReady, setIsReady] = useState(!initialize);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (initialize) {
      let cancelled = false;

      initialize(instance)
        .then(() => {
          if (!cancelled && isMountedRef.current) {
            setIsReady(true);
          }
        })
        .catch(err => {
          if (!cancelled && isMountedRef.current) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        });

      return () => {
        cancelled = true;
        isMountedRef.current = false;
      };
    }
  }, [instance, initialize]);

  return { instance, isReady, error };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// 1. Basic Usage
const service = ServiceName.getInstance();
service.doSomething();

// 2. Async Usage (Production Safe)
async function initApp() {
  const asyncService = AsyncService.getInstance();
  
  // Multiple calls are safe - will wait for same initialization
  await Promise.all([
    asyncService.initialize(),
    asyncService.initialize(),
    asyncService.initialize()
  ]);
  
  if (asyncService.isReady()) {
    const data = asyncService.getData();
  }
}

// 3. Configurable Service
const service = ConfigurableService.getInstance({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
});

// 4. Event Service with Cleanup
const eventService = EventService.getInstance();
const unsubscribe = eventService.on("userLoggedIn", (user) => {
  console.log("User logged in:", user);
});

// Later: cleanup
unsubscribe();

// 5. React Hook Usage
function MyComponent() {
  const { instance, isReady, error } = useSingleton(
    () => AsyncService.getInstance(),
    (service) => service.initialize()
  );

  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading...</div>;

  return <div>Ready to use service!</div>;
}

// 6. Cleanup in tests
afterEach(() => {
  ServiceName.resetInstance();
  AsyncService.resetInstance();
  ConfigurableService.resetInstance();
  EventService.resetInstance();
});
*/
