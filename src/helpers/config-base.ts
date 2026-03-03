import * as fs from 'fs'

/**
 * Base class for configuration management. It loads configuration and secrets from JSON files based on the specified environment.
 * The configuration files should be named in the format 'config.{environment}.json' and 'secrets.{environment}.json'.
 * If the environment is not specified or is 'production', it will look for 'config.json' and 'secrets.json'.
 */
export abstract class ConfigBase<T extends ConfigBase<T>> {
  /**
   * The loaded configuration object of type Partial<T>.
   */
  protected readonly config: Partial<T>

  /**
   * The loaded secrets object of type Partial<T>.
   */
  protected readonly secrets: Partial<T>

  constructor(environment?: string) {
    const configSuffix = environment == null || environment === '' || environment.toLowerCase() === 'production'
      ? ''
      : `.${environment}`
    const fullConfigName = `config${configSuffix}.json`
    const fullSecretsName = `secrets${configSuffix}.json`

    if (!fs.existsSync(fullConfigName)) {
      throw new Error(`Configuration file '${fullConfigName}' cannot be found.`)
    }

    this.secrets = {} as Partial<T>
    if (fs.existsSync(fullSecretsName)) {
      this.secrets = JSON.parse(fs.readFileSync(fullSecretsName, 'utf-8')) as Partial<T>
    }

    this.config = JSON.parse(fs.readFileSync(fullConfigName, 'utf-8')) as Partial<T>
  }
}