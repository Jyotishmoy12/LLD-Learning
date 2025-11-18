// ============================================
// 1. TANSTACK QUERY CLIENT SINGLETON
// ============================================

import { QueryClient } from "@tanstack/react-query";

interface QueryConfig {
  defaultStaleTime?: number;
  defaultCacheTime?: number;
  retry?: number;
}

export class TanStackQueryService {
  private static instance: TanStackQueryService | null = null;
  private queryClient: QueryClient;

  private constructor(config?: QueryConfig) {
    if (TanStackQueryService.instance) {
      throw new Error("Use TanStackQueryService.getInstance()");
    }

    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: config?.defaultStaleTime ?? 1000 * 60 * 5, // 5 minutes
          cacheTime: config?.defaultCacheTime ?? 1000 * 60 * 30, // 30 minutes
          retry: config?.retry ?? 3,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }

  public static getInstance(config?: QueryConfig): TanStackQueryService {
    if (!TanStackQueryService.instance) {
      TanStackQueryService.instance = new TanStackQueryService(config);
    }
    return TanStackQueryService.instance;
  }

  public getClient(): QueryClient {
    return this.queryClient;
  }

  // Invalidate specific queries
  public invalidateQueries(queryKey: string[]): Promise<void> {
    return this.queryClient.invalidateQueries({ queryKey });
  }

  // Clear all cache
  public clearCache(): void {
    this.queryClient.clear();
  }

  // Prefetch data
  public async prefetchQuery<T>(
    queryKey: string[],
    queryFn: () => Promise<T>
  ): Promise<void> {
    await this.queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  }

  // Set query data manually
  public setQueryData<T>(queryKey: string[], data: T): void {
    this.queryClient.setQueryData(queryKey, data);
  }

  // Get cached data
  public getQueryData<T>(queryKey: string[]): T | undefined {
    return this.queryClient.getQueryData<T>(queryKey);
  }

  public destroy(): void {
    this.queryClient.clear();
  }

  public static resetInstance(): void {
    if (TanStackQueryService.instance) {
      TanStackQueryService.instance.destroy();
      TanStackQueryService.instance = null;
    }
  }
}

// Export singleton instance for easy import
export const queryService = TanStackQueryService.getInstance({
  defaultStaleTime: 1000 * 60 * 5,
  defaultCacheTime: 1000 * 60 * 30,
  retry: 3,
});

// ============================================
// 2. CLOUDINARY SERVICE SINGLETON
// ============================================

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  folder?: string;
}

interface UploadOptions {
  file: File;
  folder?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export class CloudinaryService {
  private static instance: CloudinaryService | null = null;
  private config: CloudinaryConfig;
  private uploadUrl: string;

  private constructor(config: CloudinaryConfig) {
    if (CloudinaryService.instance) {
      throw new Error("Use CloudinaryService.getInstance()");
    }

    this.validateConfig(config);
    this.config = config;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
  }

  public static getInstance(config?: CloudinaryConfig): CloudinaryService {
    if (!CloudinaryService.instance) {
      if (!config) {
        throw new Error("Configuration required for first initialization");
      }
      CloudinaryService.instance = new CloudinaryService(config);
    }
    return CloudinaryService.instance;
  }

  private validateConfig(config: CloudinaryConfig): void {
    if (!config.cloudName) {
      throw new Error("cloudName is required");
    }
    if (!config.uploadPreset) {
      throw new Error("uploadPreset is required");
    }
  }

  /**
   * Upload image to Cloudinary
   */
  public async uploadImage(options: UploadOptions): Promise<UploadResult> {
    const { file, folder, tags, onProgress } = options;

    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.config.uploadPreset);

    if (folder || this.config.folder) {
      formData.append("folder", folder || this.config.folder!);
    }

    if (tags && tags.length > 0) {
      formData.append("tags", tags.join(","));
    }

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(Math.round(progress));
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            publicId: response.public_id,
            secureUrl: response.secure_url,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.open("POST", this.uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple images
   */
  public async uploadMultiple(
    files: File[],
    options?: Omit<UploadOptions, "file">
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage({ ...options, file })
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Generate Cloudinary URL with transformations
   */
  public generateUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      crop?: "fill" | "fit" | "scale" | "crop";
      quality?: "auto" | number;
      format?: "jpg" | "png" | "webp" | "avif";
      gravity?: "face" | "center" | "auto";
    }
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.config.cloudName}/image/upload`;
    
    if (!transformations) {
      return `${baseUrl}/${publicId}`;
    }

    const transforms: string[] = [];

    if (transformations.width) transforms.push(`w_${transformations.width}`);
    if (transformations.height) transforms.push(`h_${transformations.height}`);
    if (transformations.crop) transforms.push(`c_${transformations.crop}`);
    if (transformations.quality) transforms.push(`q_${transformations.quality}`);
    if (transformations.format) transforms.push(`f_${transformations.format}`);
    if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);

    const transformString = transforms.join(",");
    return `${baseUrl}/${transformString}/${publicId}`;
  }

  /**
   * Delete image from Cloudinary (requires API key)
   */
  public async deleteImage(publicId: string): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error("API key required for deletion");
    }

    // Note: Deletion typically requires server-side implementation
    // This is a simplified example
    console.warn("Image deletion should be handled server-side for security");
  }

  public getConfig(): Readonly<CloudinaryConfig> {
    return Object.freeze({ ...this.config });
  }

  public static resetInstance(): void {
    CloudinaryService.instance = null;
  }
}

// ============================================
// 3. SETUP IN APP
// ============================================

// App.tsx or main.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function App() {
  // Initialize TanStack Query
  const queryClient = TanStackQueryService.getInstance({
    defaultStaleTime: 1000 * 60 * 5,
  }).getClient();

  // Initialize Cloudinary
  CloudinaryService.getInstance({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    folder: "my-app-uploads",
  });

  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// ============================================
// 4. USAGE IN COMPONENTS
// ============================================

// TodoService.ts - API calls with TanStack Query
import { queryService } from "./TanStackQueryService";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  tags: string[];
}

export const TodoService = {
  // Fetch all todos
  async getTodos(): Promise<Todo[]> {
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            todos {
              id
              title
              completed
              tags
            }
          }
        `,
      }),
    });
    const { data } = await response.json();
    return data.todos;
  },

  // Add todo
  async addTodo(title: string, tags: string[]): Promise<Todo> {
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation AddTodo($title: String!, $tags: [String!]!) {
            addTodo(title: $title, tags: $tags) {
              id
              title
              completed
              tags
            }
          }
        `,
        variables: { title, tags },
      }),
    });
    const { data } = await response.json();
    
    // Invalidate cache after mutation
    await queryService.invalidateQueries(["todos"]);
    
    return data.addTodo;
  },

  // Prefetch todos (useful for better UX)
  async prefetchTodos(): Promise<void> {
    await queryService.prefetchQuery(["todos"], this.getTodos);
  },
};

// TodoList.tsx - Component using TanStack Query
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos with caching
  const { data: todos, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: TodoService.getTodos,
    staleTime: 1000 * 60 * 5, // Already set in singleton, but can override
  });

  // Add todo mutation
  const addTodoMutation = useMutation({
    mutationFn: (title: string) => TodoService.addTodo(title, ["General"]),
    onSuccess: () => {
      setNewTodo("");
      // Cache automatically invalidated by TodoService
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo);
    }
  };

  if (isLoading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New todo..."
        />
        <button onClick={handleAddTodo} disabled={addTodoMutation.isPending}>
          {addTodoMutation.isPending ? "Adding..." : "Add Todo"}
        </button>
      </div>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.tags.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ImageUpload.tsx - Component using Cloudinary
import { useState } from "react";
import { CloudinaryService } from "./CloudinaryService";

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const cloudinary = CloudinaryService.getInstance();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      const result = await cloudinary.uploadImage({
        file,
        folder: "todos",
        tags: ["todo-image"],
        onProgress: (p) => setProgress(p),
      });

      setUploadedUrl(result.secureUrl);
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const results = await cloudinary.uploadMultiple(files, {
        folder: "todos/batch",
      });
      console.log("Multiple uploads successful:", results);
    } catch (error) {
      console.error("Multiple upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload Image</h3>

      {/* Single upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* Multiple upload */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleMultipleUpload}
        disabled={uploading}
      />

      {uploading && (
        <div>
          <p>Uploading... {progress}%</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {uploadedUrl && (
        <div>
          <h4>Uploaded Image:</h4>
          <img src={uploadedUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
          
          {/* Generate transformed URLs */}
          <div>
            <h5>Transformations:</h5>
            <img
              src={cloudinary.generateUrl(uploadedUrl.split("/").pop()!, {
                width: 200,
                height: 200,
                crop: "fill",
                gravity: "face",
              })}
              alt="Thumbnail"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 5. BENEFITS OF SINGLETON PATTERN HERE
// ============================================

/*
✅ TanStack Query Benefits:
1. Single QueryClient instance across app (no duplicate cache)
2. Consistent configuration everywhere
3. Easy cache invalidation from anywhere
4. Centralized prefetching logic
5. Single source of truth for all API state

✅ Cloudinary Benefits:
1. Configuration loaded once (cloud name, upload preset)
2. Reusable upload logic across components
3. Consistent URL generation
4. No duplicate configuration in env vars
5. Easy to mock in tests
6. Progress tracking standardized

✅ General Benefits:
1. Memory efficient (one instance only)
2. Easy to test (resetInstance in tests)
3. Type-safe configuration
4. Centralized error handling
5. Lazy initialization
6. Thread-safe async operations
*/
