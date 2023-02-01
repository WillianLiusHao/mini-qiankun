export type Application = {
  name: string,
  pageEntry: string,
  container: HTMLElement | String,
  activeRule: string | Function
  status?: number | string,
  pageBody?: string,
  loadedURLs?: Array<any>,
  scripts?: Array<string>,
  styles?: Array<string>,
  isFirstLoad?: boolean,
  sandboxConfig?: any
  sandbox?: any,
  window?: any
}
