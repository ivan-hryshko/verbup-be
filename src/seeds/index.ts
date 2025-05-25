import ENVS from "../config/envs";
import { createTypeOrmConn } from "../config/app-data-source"
import addIrregWords from "./addIrregWords";

console.log('before seed', ENVS.PG_HOST);
createTypeOrmConn().then(async (connection) => {
  console.log('SEEDS START')
  await addIrregWords()
  // logger.info(`!!! SUCCESS -> FINISHED SEEDS, EXIT !!!`)
  // exit(0)
}).catch((error) => {
  console.log('error :>> ', error);
  console.log('Can\'t conenct to Postres DB');
})