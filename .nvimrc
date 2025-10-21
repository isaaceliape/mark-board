" Basic Neovim configuration for Mark Board project
set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set smartindent
set termguicolors

" Grep settings: use ripgrep and exclude docs/ folder
set grepprg=rg\ --vimgrep\ --glob="!docs/**"

" Filetype specific settings
autocmd FileType typescript,typescriptreact,javascript,javascriptreact,json,css,html setlocal tabstop=2 shiftwidth=2 expandtab
