let workflow={
  "3": {
    "inputs": {
      "seed": 924786692716691,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": [
        "4",
        0
      ],
      "positive": [
        "6",
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
  "4": {
    "inputs": {
      "ckpt_name": "deliberate_v2.safetensors"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 640,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "6": {
    "inputs": {
      "text": [
        "15",
        0
      ],
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": [
        "4",
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
      "prompt": "",
      "threshold": 0.15,
      "sam_model": [
        "12",
        0
      ],
      "grounding_dino_model": [
        "13",
        0
      ],
      "image": [
        "8",
        0
      ]
    },
    "class_type": "GroundingDinoSAMSegment (segment anything)"
  },
  "12": {
    "inputs": {
      "model_name": "sam_vit_b_01ec64.pth",
      "device_mode": "Prefer GPU"
    },
    "class_type": "SAMLoader"
  },
  "13": {
    "inputs": {
      "model_name": "GroundingDINO_SwinT_OGC (694MB)"
    },
    "class_type": "GroundingDinoModelLoader (segment anything)"
  },
  "14": {
    "inputs": {
      "invert": "invert",
      "save": "yes",
      "filename_prefix": "挖掘机",
      "images": [
        "10",
        0
      ],
      "masks": [
        "10",
        1
      ]
    },
    "class_type": "TransparentImage"
  },
  "15": {
    "inputs": {
      "random_sample":"enable",
      "max_count": 9,
      "mutable_prompt": "Swing\nSlide\nClimbing frame\nSandbox\nSee-saw\nMerry-go-round\nJungle gym\nTrampoline\nMonkey bars\nRocking horse\nPlayhouse\nHopscotch\nBalance beam\nSpring rider\nWater play area\nBall pit\nTunnel\nZip line\nBasketball hoop\nBicycle rack\nSpinner\nClimbing wall\nRope ladder\nTetherball\nFlying fox\nSwinging bridge\nSpiral slide\nWater sprinkler\nPedal go-kart\nMiniature golf course",
      "immutable_prompt": "Die-cut sticker, Cute kawaii ``,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n",
      "prompts": "Die-cut sticker, Cute kawaii Rope ladder,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Balance beam,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Ball pit,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Water play area,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Jungle gym,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Rocking horse,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Basketball hoop,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Swinging bridge,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors\n\nDie-cut sticker, Cute kawaii Climbing wall,sticker, visible stitch line, soft smooth lighting, vibrant studio lighting, modular constructivism, physically based rendering, white background, illustration minimalism, vector, pastel colors"
    },
    "class_type": "RandomPrompt"
  }
}


export function init (extensionPoints) {

  // window.electron.executeJavaScript(`
  // (()=>{
    
  // })()
  // `)

  // varFromExtensionPoint 从app传来的变量
  const yourCustomExtension = (varFromExtensionPoint) => {
    let workflowNew={};
    for(let key in workflow){
      let node=workflow[key];
      // 更新seed
      if(node.inputs?.seed) node.inputs.seed=Math.round(Math.random()*200000000000);
      workflowNew[key]=node;
    }

    workflow={...workflowNew};

    console.log('yourCustomExtension',varFromExtensionPoint)
    
    const {event,data}=varFromExtensionPoint;

    switch (event) {
      case 'run':
        const {executeWorkflow}=data;
        executeWorkflow( workflow);
        return;
      case 'executed':

        return
      case 'execution_start':

        return
      case 'progress':
        
        return
      default:
        break;
    }

  }

// app 是应用暴露的api集合
 extensionPoints.register( 'app', 'comfyui-workflow-api', yourCustomExtension );

}