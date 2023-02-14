export interface Register {
  name: string,
  activeWhen: string | Function
  app: () => Promise<any>
  customProps?: Object
}

export type Application = {
  name: string,
  activeWhen: string | Function
  app: () => Promise<any>
  customProps?: Object

  status?: number | string,
  bootstrap?: Array<(param: any) => void>
  mount?: Array<(param: any) => void>,
  unmount?:Array<(param: any) => void>
}

export type MicroWindow = Window & any
