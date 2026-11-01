import { defineConfig } from 'vite';
// Every HTML entry point builds with relative URLs, so dist/ works from any folder (the workbook host serves it from a versioned path).
export default defineConfig({base:'./',build:{rollupOptions:{input:{index:'index.html',campaign:'campaign.html',freeform:'freeform.html'}}},server:{port:5302,strictPort:true},preview:{port:4302,strictPort:true}});
