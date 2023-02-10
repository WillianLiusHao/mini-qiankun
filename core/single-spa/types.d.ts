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
  bootstrap?: (param: any) => void,
  mount?: (param: any) => void,
  unmount?: (param: any) => void,
}

export type MicroWindow = Window & any
