let workflow = {
  "4": {
    "inputs": {
      "base_ckpt_name": "sd_xl_base_1.0_0.9vae.safetensors",
      "base_clip_skip": -2,
      "refiner_ckpt_name": "sd_xl_refiner_1.0_0.9vae.safetensors",
      "refiner_clip_skip": -2,
      "positive_ascore": 6,
      "negative_ascore": 2,
      "vae_name": "Baked VAE",
      "positive": [
        "14",
        0
      ],
      "negative": "",
      "token_normalization": "none",
      "weight_interpretation": "comfy",
      "empty_latent_width": 768,
      "empty_latent_height": 1280,
      "batch_size": 1
    },
    "class_type": "Eff. Loader SDXL"
  },
  "5": {
    "inputs": {
      "noise_seed": 2,
      "steps": 20,
      "cfg": 7,
      "sampler_name": "euler",
      "scheduler": "normal",
      "start_at_step": 0,
      "refine_at_step": -1,
      "preview_method": "auto",
      "vae_decode": "true",
      "sdxl_tuple": [
        "4",
        0
      ],
      "latent_image": [
        "4",
        1
      ],
      "optional_vae": [
        "4",
        2
      ]
    },
    "class_type": "KSampler SDXL (Eff.)"
  },
  "10": {
    "inputs": {
      "images": [
        "5",
        3
      ]
    },
    "class_type": "PreviewImage"
  },
  "14": {
    "inputs": {
      "max_count": 9,
      "mutable_prompt": "The little boy, named Timmy, gazed up at the night sky with wonder.\nHe dreamed of reaching the stars and exploring the mysteries of the universe.\nTimmy built a spaceship out of cardboard boxes and imagined himself soaring through the galaxy.\nWith his trusty telescope in hand, Timmy searched for constellations and planets.\nOne night, Timmy discovered a hidden map that led to a secret planet.\nTimmy embarked on an exciting journey, following the map's clues and encountering strange creatures along the way.\nFinally, Timmy reached the secret planet and was greeted by a group of friendly aliens.\nTogether with his new alien friends, Timmy learned about the wonders of the universe and shared his own stories from Earth.\nTimmy returned home with a heart full of joy and a newfound love for the stars.",
      "immutable_prompt": "Story books illustrations,colorful ink. ``",
      "random_sample": "disable",
      "prompts": "Story books illustrations,colorful ink. The little boy, named Timmy, gazed up at the night sky with wonder.\n\nStory books illustrations,colorful ink. He dreamed of reaching the stars and exploring the mysteries of the universe.\n\nStory books illustrations,colorful ink. Timmy built a spaceship out of cardboard boxes and imagined himself soaring through the galaxy.\n\nStory books illustrations,colorful ink. With his trusty telescope in hand, Timmy searched for constellations and planets.\n\nStory books illustrations,colorful ink. One night, Timmy discovered a hidden map that led to a secret planet.\n\nStory books illustrations,colorful ink. Timmy embarked on an exciting journey, following the map's clues and encountering strange creatures along the way.\n\nStory books illustrations,colorful ink. Finally, Timmy reached the secret planet and was greeted by a group of friendly aliens.\n\nStory books illustrations,colorful ink. Together with his new alien friends, Timmy learned about the wonders of the universe and shared his own stories from Earth.\n\nStory books illustrations,colorful ink. Timmy returned home with a heart full of joy and a newfound love for the stars."
    },
    "class_type": "RandomPrompt"
  }
}

export function init (extensionPoints) {

  // varFromExtensionPoint 从app传来的变量
  const main = varFromExtensionPoint => {
    let workflowNew = {}
    for (let key in workflow) {
      let node = workflow[key]
      // 更新seed
      if (node.inputs?.seed)
        node.inputs.seed = Math.round(Math.random() * 200000000000)
      workflowNew[key] = node
    }

    workflow = { ...workflowNew }

    console.log('yourCustomExtension', varFromExtensionPoint)

    const { event, data } = varFromExtensionPoint

    switch (event) {
      case 'run':
        // 运行
        const { executeWorkflow, inputs } = data

        for (const inp of inputs) {
          if (inp.id === '14.inputs.mutable_prompt') {
            workflow['14'].inputs.mutable_prompt = inp.value.join('\n')
            // workflow['15'].inputs.mutable_prompt = inp.value;
          }
        }
        console.log('##new workflow', workflow)

        executeWorkflow(workflow)
        return

      case 'get-input':
        // 获得输入变量
        const { callback } = data
        if (callback) {
          callback([
            {
              id: '14.inputs.mutable_prompt',
              value: workflow['14'].inputs.mutable_prompt.split('\n'),
              label: '画面描述',
              type: 'block'
            }
          ])

          // callback([
          //   {
          //     id: '15.inputs.mutable_prompt',
          //     value: workflow['15'].inputs.mutable_prompt,
          //     label: '词典',
          //     type: 'string'
          //   }
          // ])

        }
        return
      case 'progress':
        return
      default:
        break
    }
  }

  // app 是应用暴露的api集合
  extensionPoints.register('app', 'picture-book', main)
}
