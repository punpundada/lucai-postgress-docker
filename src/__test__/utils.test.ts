import {describe,test,expect,afterEach,jest} from 'bun:test'
import { getHashedToken } from '../utils/utils'

describe('Utility functions',()=>{
    afterEach(()=>{
        jest.clearAllMocks();
    })
    test('getHashedToken To be called with string and return string', async ()=>{
        const str = "Helloword"
        const returnData = await getHashedToken(str);
        expect(returnData).toBeString()
    })
})