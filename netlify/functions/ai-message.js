exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { profile, workoutCount, messageType } = JSON.parse(event.body)
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Configuração pendente. Bora treinar! 💪' })
      }
    }

    const prompt = buildPrompt(profile, workoutCount, messageType)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.9
          }
        })
      }
    )

    const data = await response.json()
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: message || fallbackMessage(profile, messageType) })
    }
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Bora lá! Cada treino conta. 💪' })
    }
  }
}

function buildPrompt(profile, workoutCount, messageType) {
  const { name, age, gender, bio } = profile
  const firstName = name?.split(' ')[0] || name

  const context = `
Você é um coach pessoal motivacional para a Família Kawabe.
Perfil do usuário:
- Nome: ${firstName}
- Idade: ${age} anos
- Gênero: ${gender === 'M' ? 'Masculino' : 'Feminino'}
- Personalidade: ${bio}

Regras para a mensagem:
- Máximo 2 frases curtas e diretas
- Tom pessoal, use o primeiro nome "${firstName}"
- Em português do Brasil
- Sem emojis em excesso (máximo 1)
- Seja específico para o perfil da pessoa
`

  if (messageType === 'pre_workout') {
    return `${context}
Crie uma mensagem motivacional PRÉ-TREINO personalizada para ${firstName}. 
A pessoa ainda não treinou hoje. Incentive-a a ir treinar agora.
Seja direto e energético.`
  } else {
    return `${context}
Crie uma mensagem de PARABÉNS PÓS-TREINO personalizada para ${firstName}.
A pessoa acabou de registrar o treino de hoje. Parabenize e motive para continuar.
Seja caloroso e entusiasmado.`
  }
}

function fallbackMessage(profile, messageType) {
  const firstName = profile?.name?.split(' ')[0] || 'Campeão'
  if (messageType === 'pre_workout') {
    return `${firstName}, hoje é dia de treino! Vai lá, sem desculpas. 💪`
  }
  return `${firstName}, treino registrado! Você é consistência pura. 🔥`
}
