# autoscaling-swarm
## Raw Description
Especificação e construção de um serviço/mecanismo de autoscaling para os containers em um cluster Swarm. Basicamente é um mecanismo de saúde para garantir que se foi especificado que tenho que ter X containers rodando, vou ter sempre. E também para, se identificar que aumentou a demanda de alguma métrica, o mecanismo é responsável por aumentar tarde a quantidade de instâncias rodando. Sugestão utilizar o Orbiter.

## GQM
------------ | -------------
Goal | Garantir a disponibilidade de serviço de acordo com a demanda
Questions | Como garantir uma quantidade mínima de containers para suprir uma demanda de serviço? Como identificar a necessidade de mais demanda?
Metrics | Uso de recursos (memória, cpu); Numero de requisições

## Goal Definition Template
Analyze a oferta de serviço
for the purpose of garantir a disponibilidade
with respect to saúde do serviço
from the viewpoint of engenheiro de configuração
in the context of containers docker

## Questions Definition
* Goal
    * Question 1: Como garantir uma quantidade mínima de containers para suprir uma demanda de serviço?
    * Question 2: Como identificar a necessidade de mais demanda?

## Metrics Definition
* Question 1:
    * Metric 1: Uso de recursos (memória, cpu)
* Question 2:
    * Metric 1: Uso de recursos (memória, cpu)
    * Metric 2: Número de requisições
