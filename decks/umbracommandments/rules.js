// The ten, as carved on the tablets (short) and as said in the recap (plain).
export const CARVED = [
  'Content is not composable.',
  'There are four content types.',
  'The root is bare; a folder is only a folder.',
  'Compose in your IComposer, not in Program.cs.',
  'Production runs in production mode.',
  'Thy names: English camelCase, dotted PascalCase keys.',
  'Views render; they don’t search.',
  'Umbraco is not your database.',
  'A root node is not a rendering node.',
  'uSync, when not on Umbraco Cloud.',
]

// The tablet lines, King James. Segments: a string is carved as is; { old, new } is a correction
// the chisel makes on stage (the tablet starts with `old`), on build step `at` of that scene.
export const KJV = {
  1: ['1. Thou shalt not compose that which thou art not prepared to lose.'],
  2: [
    '2. Thou shalt recognise the ', { old: 'six', new: 'four', at: 6, delay: 100 }, ' sacred types, and the ',
    { old: 'six', new: 'four', at: 6, delay: 1000 }, ' sacred types shalt thou recognise. Neither more nor fewer shalt thou count, for ',
    { old: 'seven', new: 'five', at: 6, delay: 2000 }, ' is right out.',
  ],
  3: ['3. Thou shalt leave the root bare, and every thing shall have its house, and the house shall hold naught of its own.'],
  4: ['4. Thou shalt take thy registrations unto the Composer, for Program.cs is not thy dustbin.'],
  5: ['5. Thou shalt not deployeth in debug mode and call it production, for that is an abomination.'],
  6: ['6. Thou shalt alias in English and in camelCase, and key thy translations in PascalCase, dotted, and thy tongue shall not slip into Danish, not even once.'],
  7: ['7. Thou shalt not walk the whole tree to find one fruit.'],
  8: ['8. Thou shalt not make a warehouse of the tree.'],
  9: [
    {
      old: '9. Thou shalt place only a Repository at the root, for a Page at the root is a Page without honour.',
      new: '9. Thou shalt never assign a Template unto the Root, for a Root that Rendereth is an Abomination, and the Path to Madness.',
      at: 1, delay: 700, block: true,
    },
  ],
  10: ['10. Thou shalt uSync, for without uSync thy changes are as whispers in the wind, and the wind doth not git commit.'],
  // typos kept: they're on brand
  11: ['11. Above else – do whateveth you deem rightous for thy project and rejoice in thy work. I’m not your mum.'],
}

export const PLAIN = [
  'Content is not composable.',
  'Four content types: Page, Block, Data, Composition.',
  'The root is bare, and a folder is only a folder.',
  'Compose in your IComposer, not in Program.cs.',
  'A production site runs in production mode.',
  'Aliases: English camelCase. Keys: PascalCase, dotted.',
  'Views render; they don’t search.',
  'Umbraco is not your database.',
  'A root node is not a rendering node.',
  'uSync when you’re not on Umbraco Cloud.',
]
