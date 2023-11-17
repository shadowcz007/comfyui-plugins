let workflow = {
  "3": {
    "inputs": {
      "seed": 726376171763887,
      "steps": 4,
      "cfg": 1.7,
      "sampler_name": "lcm",
      "scheduler": "simple",
      "denoise": 1,
      "model": [
        "10",
        0
      ],
      "positive": [
        "13",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "25",
        0
      ]
    },
    "class_type": "KSampler"
  },
  "4": {
    "inputs": {
      "ckpt_name": "deliberate_v2.safetensors"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "6": {
    "inputs": {
      "text": "a man ,play ball",
      "clip": [
        "10",
        1
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "embeddings:verybadimagenegative_v1.3.pt",
      "clip": [
        "10",
        1
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode"
  },
  "10": {
    "inputs": {
      "lora_name": "lcm-lora-sdv1-5.safetensors",
      "strength_model": 1,
      "strength_clip": 1,
      "model": [
        "4",
        0
      ],
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "LoraLoader"
  },
  "12": {
    "inputs": {
      "image": "image1700203890773.png",
      "choose file to upload": "image"
    },
    "class_type": "LoadImage"
  },
  "13": {
    "inputs": {
      "strength": 1,
      "conditioning": [
        "6",
        0
      ],
      "control_net": [
        "16",
        0
      ],
      "image": [
        "18",
        0
      ]
    },
    "class_type": "ControlNetApply"
  },
  "15": {
    "inputs": {
      "images": [
        "18",
        0
      ]
    },
    "class_type": "PreviewImage"
  },
  "16": {
    "inputs": {
      "control_net_name": "t2iadapter_seg-fp16.safetensors"
    },
    "class_type": "ControlNetLoader"
  },
  "18": {
    "inputs": {
      "resolution": 320,
      "image": [
        "12",
        0
      ]
    },
    "class_type": "SAMPreprocessor"
  },
  "25": {
    "inputs": {
      "pixels": [
        "12",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEEncode"
  },
  "44": {
    "inputs": {
      "filename_prefix": "draw_design",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage"
  }
}

function updateSeed () {
  let workflowNew = {}
  for (let key in workflow) {
    let node = workflow[key]
    // 更新seed
    if (node.inputs?.seed)
      node.inputs.seed = Math.round(Math.random() * 200000000000)

    if (node.inputs?.noise_seed)
      node.inputs.noise_seed = Math.round(Math.random() * 200000000000)

    workflowNew[key] = node
  }
  return workflowNew
}

export function init (extensionPoints) {
  // varFromExtensionPoint 从app传来的变量
  const main = async varFromExtensionPoint => {
    console.log('yourCustomExtension', varFromExtensionPoint)

    const { event, data } = varFromExtensionPoint

    switch (event) {
      case 'run':
        // 运行
        const { executeWorkflow, inputs, seedUpdate } = data

        if (seedUpdate) {
          workflow = { ...updateSeed() }
        }

        for (const inp of inputs) {
          //
          if (inp.id === '12.inputs.image') {
            // 传入图片
            workflow['12'].inputs.image = inp.value
          }

          if (inp.id === '6.inputs.text') {
            // 传入图片
            workflow['6'].inputs.text = inp.value
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
              id: '12.inputs.image',
              value: workflow['12'].inputs.image,
              label: '图片',
              type: 'image'
            },
            {
              id: '6.inputs.text',
              value: workflow['6'].inputs.text,
              label: '描述画面',
              type: 'string'
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

  // 注册插件名称，
  extensionPoints.register('draw-design', 'draw-design', main)
}
