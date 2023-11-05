let workflow ={
  "3": {
    "inputs": {
      "seed": 317589049497487,
      "steps": 26,
      "cfg": 8,
      "sampler_name": "uni_pc_bh2",
      "scheduler": "normal",
      "denoise": 1,
      "model": [
        "32",
        0
      ],
      "positive": [
        "19",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "KSampler"
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 768,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "6": {
    "inputs": {
      "text": [
        "39",
        0
      ],
      "clip": [
        "32",
        1
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "embedding:verybadimagenegative_v1.3",
      "clip": [
        "32",
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
        "32",
        2
      ]
    },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": {
      "filename_prefix": "gamerole",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage"
  },
  "13": {
    "inputs": {
      "clip_vision": [
        "32",
        3
      ],
      "image": [
        "47",
        0
      ]
    },
    "class_type": "CLIPVisionEncode"
  },
  "19": {
    "inputs": {
      "strength": 1.0000000000000002,
      "noise_augmentation": 0.1,
      "conditioning": [
        "6",
        0
      ],
      "clip_vision_output": [
        "13",
        0
      ]
    },
    "class_type": "unCLIPConditioning"
  },
  "32": {
    "inputs": {
      "ckpt_name": "illuminatiDiffusionV1_v11-unclip-h-fp16.safetensors"
    },
    "class_type": "unCLIPCheckpointLoader"
  },
  "39": {
    "inputs": {
      "max_count": 12,
      "mutable_prompt": "Human warrior with a muscular build and exceptional swordsmanship skills\nElf archer with slender features and extraordinary agility\nDwarven engineer with a stocky physique and remarkable mechanical expertise\nOrc brute with a towering stature and incredible strength\nMermaid sorceress with iridescent scales and powerful water manipulation abilities\nCentaur scout with a horse-like lower body and exceptional tracking skills\nGoblin thief with a sneaky demeanor and exceptional lockpicking abilities\nFairy healer with delicate wings and extraordinary restorative powers\nLizardfolk shaman with scaled skin and potent nature-based magic\nAndroid hacker with a sleek metallic appearance and unparalleled computer hacking skills\nVampire illusionist with pale skin and mind-controlling abilities\nWerewolf berserker with a rugged appearance and enhanced strength\nFairy bard with colorful wings and enchanting musical abilities\nTroll brawler with a hulking frame and regenerative powers\nWitch necromancer with dark robes and the ability to raise the dead\nSiren enchantress with mesmerizing beauty and alluring voice\nGoblin alchemist with green skin and expertise in potion-making\nDwarf blacksmith with a stout build and unmatched weapon-crafting skills\nElf ranger with ethereal beauty and unparalleled archery skills\nCentaur healer with a horse-like lower body and restorative magic abilities\nMermaid warrior with shimmering scales and proficiency in underwater combat\nOgre brute with a massive physique and incredible brute strength\nNymph druid with flowing hair and the power to control nature\nDragonborn sorcerer with dragon-like features and mastery over elemental magic\nGnome inventor with a quirky appearance and ingenious gadget creation skills\nSatyr rogue with goat-like legs and exceptional stealth abilities\nElemental mage with an otherworldly appearance and control over fire, water, earth, and air\nAngelic paladin with radiant wings and divine healing and smiting powers\nDemon warlock with demonic features and dark spellcasting abilities\nHuman monk with a disciplined physique and mastery of martial arts techniques",
      "immutable_prompt": "``",
      "random_sample": "enable",
      "prompts": "Dwarven engineer with a stocky physique and remarkable mechanical expertise\n\nWerewolf berserker with a rugged appearance and enhanced strength\n\nDemon warlock with demonic features and dark spellcasting abilities\n\nGnome inventor with a quirky appearance and ingenious gadget creation skills\n\nElf archer with slender features and extraordinary agility\n\nSatyr rogue with goat-like legs and exceptional stealth abilities\n\nElf ranger with ethereal beauty and unparalleled archery skills\n\nAndroid hacker with a sleek metallic appearance and unparalleled computer hacking skills\n\nAngelic paladin with radiant wings and divine healing and smiting powers\n\nHuman warrior with a muscular build and exceptional swordsmanship skills\n\nSiren enchantress with mesmerizing beauty and alluring voice\n\nFairy healer with delicate wings and extraordinary restorative powers"
    },
    "class_type": "RandomPrompt"
  },
  "42": {
    "inputs": {
      "seed": 6,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": [
        "43",
        0
      ],
      "positive": [
        "44",
        0
      ],
      "negative": [
        "46",
        0
      ],
      "latent_image": [
        "49",
        0
      ]
    },
    "class_type": "KSampler"
  },
  "43": {
    "inputs": {
      "ckpt_name": "deliberate_v2.safetensors"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "44": {
    "inputs": {
      "text": [
        "53",
        0
      ],
      "clip": [
        "45",
        0
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "45": {
    "inputs": {
      "stop_at_clip_layer": -2,
      "clip": [
        "43",
        1
      ]
    },
    "class_type": "CLIPSetLastLayer"
  },
  "46": {
    "inputs": {
      "text": "embedding:verybadimagenegative_v1.3",
      "clip": [
        "45",
        0
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "47": {
    "inputs": {
      "samples": [
        "42",
        0
      ],
      "vae": [
        "43",
        2
      ]
    },
    "class_type": "VAEDecode"
  },
  "49": {
    "inputs": {
      "width": 512,
      "height": 768,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "50": {
    "inputs": {
      "images": [
        "47",
        0
      ]
    },
    "class_type": "PreviewImage"
  },
  "53": {
    "inputs": {
      "max_count": 1,
      "mutable_prompt": "a young boy with a determined expression, wearing a high-tech spacesuit, exploring the mysteries of outer space, equipped with a jetpack and a laser blaster, surrounded by futuristic technology and alien landscapes, with a diverse team of companions, including a humanoid robot and a friendly extraterrestrial creature.Whimsical and colorful illustrations, reminiscent of a fairy tale, with vibrant and playful characters, enchanting landscapes, and magical creatures. The style is characterized by soft lines, pastel colors, and a dreamlike quality.",
      "immutable_prompt": "``.The illustrations are filled with intricate details and imaginative elements,trend on artstation",
      "random_sample": "enable",
      "prompts": "a young boy with a determined expression, wearing a high-tech spacesuit, exploring the mysteries of outer space, equipped with a jetpack and a laser blaster, surrounded by futuristic technology and alien landscapes, with a diverse team of companions, including a humanoid robot and a friendly extraterrestrial creature.Whimsical and colorful illustrations, reminiscent of a fairy tale, with vibrant and playful characters, enchanting landscapes, and magical creatures. The style is characterized by soft lines, pastel colors, and a dreamlike quality..The illustrations are filled with intricate details and imaginative elements,trend on artstation"
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

      if (node.inputs?.noise_seed)
        node.inputs.noise_seed = Math.round(Math.random() * 200000000000)

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
          if (inp.id === '53.inputs.mutable_prompt') {
            workflow['53'].inputs.mutable_prompt = inp.value.join('\n')
            workflow['53'].inputs.max_count = inp.value.length
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
              id: '53.inputs.mutable_prompt',
              value: workflow['53'].inputs.mutable_prompt.split('\n'),
              label: '角色描述',
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

  // 注册插件名称，
  extensionPoints.register('character-workflow', 'character-workflow', main)
}
