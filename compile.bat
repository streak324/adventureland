call tsc --project code/tsconfig.1.json -outDir out/tsc/1
call browserify out/tsc/1/common.js -o out/bundle/common.1.js