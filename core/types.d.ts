export type Application = {
  name: string,
  pageEntry: string,
  container: HTMLElement | String,
  activeRule: string | Function
  status?: number | string,
  pageBody?: string,
  loadedURLs?: Array<string>,
  scripts?: Array<string>,
  styles?: Array<string>,
  isFirstLoad?: boolean,
  sandboxConfig?: any
  sandbox?: any,
  /**
     * app 加载方法
     */
   mount?: (app: any) => Promise<any>
   /**
    * app 卸载方法
    */
   unmount?: (app: any) => Promise<any>
   /**
    * app 生命周期钩子，加载页面资源前触发，只会触发一次
    */
   beforeBootstrap?: () => void
   /**
    * app 生命周期钩子，页面入口的资源被加载并执行后触发，只会触发一次
    */
   bootstrapped?: () => void
   /**
    * app 生命周期钩子，挂载前触发
    */
   beforeMount?: () => void
   /**
    * app 生命周期钩子，挂载后触发
    */
   mounted?: () => void
   /**
    * app 生命周期钩子，卸载前触发
    */
   beforeUmount?: () => void
   /**
    * app 生命周期钩子，卸载后触发
    */
   unmounted?: () => void
}

export type MicroWindow = Window & any
