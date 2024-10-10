import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
const response = await ollama.generate({
  model: 'tinyllama',
  messages: [{ role: 'user', content: 'explain the basics of SQL select syntax' }],
})
console.log(response);
