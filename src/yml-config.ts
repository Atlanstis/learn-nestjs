import * as yml from 'js-yaml';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as _ from 'lodash';

export default async () => {
  const commonConfigFilePath = join(process.cwd(), 'config/common.yml');
  const commonConfigFile = await readFile(commonConfigFilePath, 'utf-8');
  const commonConfig = yml.load(commonConfigFile);
  const envConfigFilePath = join(
    process.cwd(),
    `config/${process.env.NODE_ENV || 'development'}.yml`,
  );
  const envConfigFile = await readFile(envConfigFilePath, 'utf-8');
  const envConfig = yml.load(envConfigFile);
  return _.merge(commonConfig, envConfig);
};
