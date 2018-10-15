# autoscaling-swarm
## Raw Description
Especificação e construção de um serviço/mecanismo de autoscaling para os containers em um cluster Swarm. Basicamente é um mecanismo de saúde para garantir que se foi especificado que tenho que ter X containers rodando, vou ter sempre. E também para, se identificar que aumentou a demanda de alguma métrica, o mecanismo é responsável por aumentar tarde a quantidade de instâncias rodando. Sugestão utilizar o Orbiter.

## GQM

| Goal | Promover auto-escalabilidade em um cluster Swarm de acordo com a sua demanda de recursos |
| ------------- | ------------- |
| Questions | Quantas instâncias estão em execução no cluster? Como determinar a necessidade de escalabilidade? |
| Metrics | Quantidade de instâncias; Uso de CPU; Uso de memória|

## Goal Definition Template
Monitorar cluster
com o propósito de promover auto-escalabilidade
com respeito recursos computacionais
do ponto de vista do engenheiro de configuração
no contexto de containers docker

## Questions Definition
* Goal
    * Question 1: Quantas instâncias estão em execução no cluster?
    * Question 2: Como determinar a necessidade de escalabilidade?

## Metrics Definition
* Question 1:
    * Metric 1: Quantidade de instâncias
* Question 2:
    * Metric 2: Uso de CPU
    * Metric 3: Uso de memória
