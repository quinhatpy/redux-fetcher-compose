export enum FetchStatus {
  Init = 'Init',
  Pending = 'Pending',
  Done = 'Done',
  Aborted = 'Aborted',
  Timeout = 'Timeout',
}

export enum DataStatus {
  /**
   * Is initial state
   */
  Initial = 'Initial',

  /**
   * Pending on first request
   */
  Initializing = 'Initializing',

  /**
   * Done on first request
   */
  Initialized = 'Initialized',

  /**
   * Pending since first request
   */
  Updating = 'Updating',

  /**
   * Done since first request
   */
  Updated = 'Updated',

  /**
   * Is requesting
   */
  Loading = 'Loading',

  /**
   * Response was error
   */
  Error = 'Error',

  /**
   * Response was succeed
   */
  Success = 'Success',

  /**
   * Response was aborted
   */
  Aborted = 'Aborted',

  /**
   * Response was timeout
   */
  Timeout = 'Timeout',
}
