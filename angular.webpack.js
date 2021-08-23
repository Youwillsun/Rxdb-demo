/**
 * Custom angular webpack configuration
 * https://webpack.docschina.org/configuration/target/#target
 */

module.exports = (config, options) => {
  config.target = 'electron-renderer';


  if (options.fileReplacements) {
    for (let fileReplacement of options.fileReplacements) {
      if (fileReplacement.replace !== 'src/environments/environment.ts') {
        continue;
      }

      let fileReplacementParts = fileReplacement['with'].split('.');
      if (fileReplacementParts.length > 1 && ['web'].indexOf(fileReplacementParts[1]) >= 0) {
        config.target = 'web';
      }
      break;
    }
  }

  /**
   * externals 加载外部外部扩展，在 运行时 可用，打包时会从 bundle 中剔除。
   * 所以打包后会出现 cannot find module "leveldown"
   * 
   * 解决方案：
   * 在 项目根目录下的/app 关于electron的配置中再次下载 leveldown
   */
  config.externals = {
    "leveldown": "require('leveldown')"
  }

  config.resolve = {
    ...config.resolve,
    fallback: {
      "stream": false,
      "path": false,
      "assert": false,
      "crypto": false,
      "os": false,
    }
  }

  return config;
}
