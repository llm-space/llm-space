import { Thread } from "../threads/thread";

/**
 * Storage for threads: read and overwrite a single Thread by path.
 *
 * Designed to pair with ThreadPlayground — `read` provides its `initialValue`
 * and `write` persists its `onChange`. Serialization between Thread and its
 * on-disk representation is handled inside the implementation; callers only
 * ever see a Thread.
 */
export interface ThreadStorage {
  /**
   * Read and parse the Thread stored at the given path.
   */
  read(path: string): Promise<Thread>;

  /**
   * Overwrite the file at the given path with the serialized Thread, creating
   * parent directories as needed.
   */
  write(path: string, thread: Thread): Promise<void>;
}
