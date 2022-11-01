## How to add a strategy:

1. Add the name of your strategy to `CONFIG.ts` (e.g. `MY_STRATEGY: 'My Strategy',`)
2. Copy `controller.bdao.ts` and rename it to `controller.<any-name-you-like>.ts`
3. Open the file you've just created and make the following changes:
   1. Update `name` property of `const conf` object to `MY_STRATEGY`
   2. Change the class name from `BanklessDaoStrategy` to anything you like (e.g. `MyStrategy`)
   3. Delete all content of `strategy` and `responseTransformer` methods and write your own strategy implementation here.
   4. Add your strategy to the export in `index.ts`

It will now be available on the api.