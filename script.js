const canvas = document.getElementById("canvas3d");

const engine = new BABYLON.Engine(
    canvas,
    true
);

let scene;

let modeloAtual = null;


const produtos = {

    "runner-x": {
        nome: "Runner X",
        categoria: "CORRIDA",
        descricao: "Modelo leve com tecnologia EVA Flex para amortecimento.",
        arquivo: "runner-x.glb",
        cor: new BABYLON.Color3(0.1, 0.4, 1)
    },

    "street-pro": {
        nome: "Street Pro",
        categoria: "URBANO",
        descricao: "Modelo urbano equipado com sistema Air Cushion.",
        arquivo: "street-pro.glb",
        cor: new BABYLON.Color3(0.9, 0.1, 0.1)
    },

    "speed-max": {
        nome: "Speed Max",
        categoria: "PERFORMANCE",
        descricao: "Tênis de performance com tecnologia Carbon Plate.",
        arquivo: "speed-max.glb",
        cor: new BABYLON.Color3(0.1, 0.8, 0.3)
    },

    "urban-flex": {
        nome: "Urban Flex",
        categoria: "CASUAL",
        descricao: "Modelo confortável com solado desenvolvido para flexibilidade.",
        arquivo: "urban-flex.glb",
        cor: new BABYLON.Color3(1, 0.5, 0.1)
    }

};


function criarCena() {

    scene = new BABYLON.Scene(engine);

    scene.clearColor =
        new BABYLON.Color4(
            0.04,
            0.04,
            0.04,
            1
        );


    const camera =
        new BABYLON.ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3,
            5,
            new BABYLON.Vector3(
                0,
                0.7,
                0
            ),
            scene
        );


    camera.attachControl(
        canvas,
        true
    );


    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;


    const luz =
        new BABYLON.HemisphericLight(
            "luz",
            new BABYLON.Vector3(
                0,
                1,
                0
            ),
            scene
        );


    luz.intensity = 1.4;


    const luzFrontal =
        new BABYLON.PointLight(
            "luzFrontal",
            new BABYLON.Vector3(
                0,
                3,
                -3
            ),
            scene
        );


    luzFrontal.intensity = 20;


    const chao =
        BABYLON.MeshBuilder.CreateGround(
            "chao",
            {
                width: 10,
                height: 10
            },
            scene
        );


    const materialChao =
        new BABYLON.StandardMaterial(
            "materialChao",
            scene
        );


    materialChao.diffuseColor =
        new BABYLON.Color3(
            0.08,
            0.08,
            0.08
        );


    chao.material =
        materialChao;


    return scene;
}


scene = criarCena();


function criarModeloProvisorio(produto) {

    if (modeloAtual) {

        modeloAtual.forEach(
            objeto => objeto.dispose()
        );

    }

    modeloAtual = [];


    const material =
        new BABYLON.StandardMaterial(
            "materialTenis",
            scene
        );


    material.diffuseColor =
        produto.cor;


    const corpo =
        BABYLON.MeshBuilder.CreateBox(
            "corpoTenis",
            {
                width: 3,
                height: 0.8,
                depth: 1.5
            },
            scene
        );


    corpo.position.y = 0.8;

    corpo.material = material;


    const frente =
        BABYLON.MeshBuilder.CreateSphere(
            "frenteTenis",
            {
                diameter: 1.6
            },
            scene
        );


    frente.scaling =
        new BABYLON.Vector3(
            1.4,
            0.5,
            0.8
        );


    frente.position =
        new BABYLON.Vector3(
            1.2,
            0.7,
            0
        );


    frente.material = material;


    const sola =
        BABYLON.MeshBuilder.CreateBox(
            "sola",
            {
                width: 3.5,
                height: 0.25,
                depth: 1.7
            },
            scene
        );


    sola.position.y = 0.35;


    const materialSola =
        new BABYLON.StandardMaterial(
            "materialSola",
            scene
        );


    materialSola.diffuseColor =
        new BABYLON.Color3(
            0.9,
            0.9,
            0.9
        );


    sola.material =
        materialSola;


    modeloAtual.push(
        corpo,
        frente,
        sola
    );


    corpo.rotation.y =
        Math.PI / 2;

    frente.rotation.y =
        Math.PI / 2;

    sola.rotation.y =
        Math.PI / 2;
}


async function carregarModelo(produto) {

    if (modeloAtual) {

        modeloAtual.forEach(
            objeto => objeto.dispose()
        );

        modeloAtual = null;
    }


    try {

        const resultado =
            await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "./modelos/",
                produto.arquivo,
                scene
            );


        modeloAtual =
            resultado.meshes;


        const meshes =
            resultado.meshes.filter(
                mesh => mesh.getTotalVertices() > 0
            );


        if (meshes.length > 0) {

            const minMax =
                BABYLON.Mesh.MinMax(
                    meshes
                );


            const centro =
                minMax.min.add(
                    minMax.max
                ).scale(0.5);


            const tamanho =
                minMax.max.subtract(
                    minMax.min
                );


            const maior =
                Math.max(
                    tamanho.x,
                    tamanho.y,
                    tamanho.z
                );


            const escala =
                3 / maior;


            resultado.meshes.forEach(
                mesh => {

                    mesh.scaling =
                        new BABYLON.Vector3(
                            escala,
                            escala,
                            escala
                        );

                }
            );


            resultado.meshes[0].position =
                resultado.meshes[0].position.subtract(
                    centro.scale(escala)
                );

        }

    } catch (erro) {

        console.log(
            "Modelo GLB não encontrado."
        );

        console.log(
            "Usando modelo provisório."
        );

        criarModeloProvisorio(
            produto
        );
    }
}


function abrirProduto(id) {

    const produto =
        produtos[id];


    if (!produto) {
        return;
    }


    document.getElementById(
        "modal-title"
    ).textContent =
        produto.nome;


    document.getElementById(
        "modal-category"
    ).textContent =
        produto.categoria;


    document.getElementById(
        "modal-description"
    ).textContent =
        produto.descricao;


    document.getElementById(
        "modal"
    ).classList.add(
        "active"
    );


    setTimeout(() => {

        engine.resize();

        carregarModelo(
            produto
        );

    }, 100);
}


function fecharProduto() {

    document.getElementById(
        "modal"
    ).classList.remove(
        "active"
    );


    if (modeloAtual) {

        modeloAtual.forEach(
            objeto => objeto.dispose()
        );

        modeloAtual = null;
    }
}


document.getElementById(
    "modal"
).addEventListener(
    "click",
    function(event) {

        if (
            event.target === this
        ) {

            fecharProduto();

        }

    }
);


engine.runRenderLoop(
    () => {

        if (scene) {

            scene.render();

        }

    }
);


window.addEventListener(
    "resize",
    () => {

        engine.resize();

    }
);