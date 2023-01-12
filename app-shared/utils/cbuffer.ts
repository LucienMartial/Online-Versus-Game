/**
 * Rotative buffer, cannot exceed capacity, do not need to be
 * realocated, push, pop are O(1)
 */
class CBuffer<T> {
  private capacity: number;
  private array: T[];
  private front: number;
  private _size: number;
  private _last: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.array = new Array(capacity);
    this._size = 0;
    this.front = 0;
    this._last = 0;
  }

  private get_index(n: number): number {
    return (this.front + n + this.capacity - this._size) % this.capacity;
  }

  size(): number {
    return this._size;
  }

  last(): T {
    return this.array[this._last];
  }

  first(): T {
    const index = this.get_index(0);
    return this.array[index];
  }

  push(value: T) {
    this.array[this.front] = value;
    this._last = this.front;
    this.front = (this.front + 1) % this.capacity;
    this._size = Math.min(this._size + 1, this.capacity);
  }

  shift(): T {
    const index = this.get_index(0);
    const value = this.array[index];
    this.array[index] = undefined!;
    this.remove(1);
    return value;
  }

  pop(): T {
    const value = this.last();
    this.front = this._last;
    this.array[this.front] = undefined!;
    this._size = Math.max(this._size - 1, 0);
    this._last = (this._last + this.capacity - 1) % this.capacity;
    return value;
  }

  /**
   * Remove n element from the front
   */
  remove(n: number) {
    this._size = Math.max(this._size - n, 0);
  }

  /**
   * Remove all elements
   */
  clear() {
    this._size = 0;
  }

  /**
   * Give back n elements starting from index in an array
   */
  slice(start: number, n: number): T[] {
    n = Math.min(n, this._size);
    start = Math.max(start, 0);
    start = Math.min(start, this._size);

    const array = new Array(n);
    let index = this.get_index(start);

    // populate array
    for (let i = 0; i < n; i++) {
      array[i] = this.array[index];
      index = (index + 1) % this.capacity;
    }

    return array;
  }

  /**
   * Give back all the values in an array
   */
  toArray(): T[] {
    return this.slice(0, this._size);
  }
}

export { CBuffer };
