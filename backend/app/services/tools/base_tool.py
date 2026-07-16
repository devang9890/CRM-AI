from abc import ABC, abstractmethod


class BaseTool(ABC):
    name: str
    description: str

    @abstractmethod
    def invoke(self, **kwargs):
        raise NotImplementedError