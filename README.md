# autoscaling-rancher-grafana
## Raw Description
Especificação e construção de um serviço/mecanismo de autoscaling para os containers em um cluster. Basicamente é um mecanismo de saúde para garantir que se foi especificado que tenho que ter X containers rodando, vou ter sempre. E também para, se identificar que aumentou a demanda de alguma métrica, o mecanismo é responsável por aumentar tarde a quantidade de instâncias rodando. Sugestão utilizar o Orbiter.

## GQM

| Goal | Promover auto-escalabilidade em um cluster Swarm de acordo com a sua demanda de recursos |
| ------------- | ------------- |
| Questions | Como levantar automáticamente novos containers em cluster? Como monitorar os recursos para determinar a escalabilidade? |
| Metrics | Quantidade de instâncias; Uso de CPU;|

## Goal Definition Template
Monitorar cluster
com o propósito de promover auto-escalabilidade
com respeito recursos computacionais
do ponto de vista do engenheiro de configuração
no contexto de containers docker

## Questions Definition
* Goal
    * Question 1: Como levantar automáticamente novos containers em cluster?
    * Question 2: Como monitorar os recursos para determinar a escalabilidade?

## Metrics Definition
* Question 1:
    * Metric 1: Quantidade de instâncias
* Question 2:
    * Metric 2: Uso de CPU

##  Ferramentas
* Rancher
* Grafana
* scaleservice-simple

## Preparação das Ferramentas
* Leia [PREPARING](PREPARING.MD)

## Serviço de Escalabilidade
### scaleservice-simple
Foi escrito em nodejs e funciona como um conector entre o Rancher e o Grafana. Ele cria os webhook no Rancher e cria os alertas no Grafana para os seviços indicados. Além disso ele recebe os alertas e redireciona para o webhook no Rancher.

o scaleservice-simple irá filtrar os serviços que possuem um JSON na descrição. Um exemplo de JSON:

	{scale.up: <instancias>, scale.up.cpu: <threshould>}
	{scale.up: 1, scale.up.cpu: 5000}

Para usar o serviço você precisa acessar os endpoints:

* Retorna as variáveis salvas no serviço

        /
* Acessa o Rancher e o Grafana e extrai os serviços com descrição no formato definido, alertas cadastrados e webhooks cadastrados. Além disso ele faz o setup de Dashboard, Alerts e Webhooks quando não existe. Faz a atualização de todos as variáveis.

        /update
* Retorna os serviços extraidos e salvos no serviço
 
        /service
* Extrai e atualiza os serviços marcados

        /service/update
* Retorna os webhooks extraidos e salvos no serviço

        /webhook
* Extrai e atualiza os webhooks

        /webhook/update

### Relatório de Projeto e Vídeo de Apresentação de Uso
* [Relatório](Relatorio_Projeto.pdf)
* [Vídeo](https://www.youtube.com/watch?v=KjUftPviaOs)

# TODO
Ainda é necessário criar um TOKEN de acesso no Grafana e indicar os domínios dos sistema direto no código. Será criado um endpoint para atualização dessas variáveis.
