import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {


  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>){

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;  
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
   // return `This action returns a #${id} pokemon`;
    let pokemon: Pokemon;
    if (! isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no : term});
    }

    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()});
    }

    if(!pokemon) throw new NotFoundException(`Pkemon no existe "${term}" pokemon`);    
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
   // return `This action updates a #${id} pokemon`;
   const pokemon = await this.findOne(term);
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

     //const updatePokemon =  await pokemon.updateOne(updatePokemonDto, {new: true});
     try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0)
        throw new BadRequestException(`Pokemon el "${id}" not found`);
    
    return;
  }

  private handleExceptions(error: any){
    if( error.code === 11000){
      throw new BadRequestException(`pOKEMON EXIST EN DB ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Error desconocido check servidor log`);
  }
}
